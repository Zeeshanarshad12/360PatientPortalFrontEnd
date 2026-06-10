'use client';

import { Box, Typography, Button, keyframes } from '@mui/material';
import { ConsentForm } from '@/types/ConsentForm';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { useRef, useState, useEffect } from 'react';
import SignatureDialog from './SignatureDialog';
import {
  saveConsentForm,
  uploadAndSaveConsentFormDocument
} from '@/slices/patientprofileslice';
import { useDispatch } from '@/store/index';
import { Snackbar, Alert } from '@mui/material';
import { useConsentFormContext } from '@/contexts/ConsentFormContext';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import {
  applyPendingConsentFormCount,
  notifyConsentCountUpdated
} from '@/utils/consentFormCountUtils';

// ── Types ─────────────────────────────────────────────────────────────────
interface Props {
  form: (ConsentForm & { Signature?: string }) | null;
  onFormSigned: (
    formId: string,
    Signature: string,
    renderedHTML: string
  ) => void;
  pendingForms: (ConsentForm & { Signature?: string })[];
  onSelectForm: (form: ConsentForm & { Signature?: string }) => void;
  triggerRefresh: () => void;
  noForms?: boolean;
}

// ── Animation ─────────────────────────────────────────────────────────────
const bounce = keyframes`
  0%   { transform: scale(1); opacity: 0.8; }
  50%  { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

// ── extractBodyText — plain text for upload PDF ───────────────────────────
const extractBodyText = (html: string, titleToExclude: string): string => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return parsed.body.innerText
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && l !== titleToExclude.trim())
    .join('\n');
};

// ── Segment type ──────────────────────────────────────────────────────────
interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
  fontSize: number;
  isNewline: boolean;
  align: 'left' | 'center' | 'right';
}

// ── extractFormattedSegments ──────────────────────────────────────────────
// Walks DOM preserving bold/italic/heading per node for jsPDF rendering.
// Key fix: inline elements (strong/em) do NOT emit newlines — only block
// elements do, preventing bold text from breaking onto separate lines.
const extractFormattedSegments = (
  html: string,
  titleToExclude: string
): TextSegment[] => {
  // Strip injected <style> tag before parsing to avoid garbage chars
  const cleanHtml = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');
  const segments: TextSegment[] = [];

  const BLOCK_TAGS = new Set([
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'li',
    'div',
    'br',
    'blockquote'
  ]);
  const INLINE_TAGS = new Set(['strong', 'b', 'em', 'i', 'u', 'span', 'a']);

  const getAlign = (el: Element): 'left' | 'center' | 'right' => {
    const style = el.getAttribute('style') ?? '';
    const cls = el.getAttribute('class') ?? '';
    if (
      style.includes('text-align:center') ||
      style.includes('text-align: center') ||
      cls.includes('center-align')
    )
      return 'center';
    if (
      style.includes('text-align:right') ||
      style.includes('text-align: right') ||
      cls.includes('right-align')
    )
      return 'right';
    return 'left';
  };

  const walk = (
    node: Node,
    bold: boolean,
    italic: boolean,
    fontSize: number,
    align: 'left' | 'center' | 'right'
  ) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (text.trim()) {
        segments.push({
          text,
          bold,
          italic,
          fontSize,
          isNewline: false,
          align
        });
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    let isBold = bold;
    let isItalic = italic;
    let fSize = fontSize;
    let blockAlign = align;

    // Inline style modifiers — no newlines emitted
    if (tag === 'strong' || tag === 'b') isBold = true;
    if (tag === 'em' || tag === 'i') isItalic = true;

    // Block elements — set heading size and emit newline BEFORE
    if (BLOCK_TAGS.has(tag)) {
      blockAlign = getAlign(el);

      if (tag === 'h1') {
        fSize = 16;
        isBold = true;
      }
      if (tag === 'h2') {
        fSize = 13;
        isBold = true;
      }
      if (tag === 'h3') {
        fSize = 12;
        isBold = true;
      }
      if (tag === 'h4') {
        fSize = 11;
        isBold = true;
      }

      if (tag === 'br') {
        segments.push({
          text: '\n',
          bold: false,
          italic: false,
          fontSize: fSize,
          isNewline: true,
          align: 'left'
        });
        return;
      }

      // Newline before block
      segments.push({
        text: '\n',
        bold: false,
        italic: false,
        fontSize: fSize,
        isNewline: true,
        align: 'left'
      });
    }

    // Skip img tags — handled separately in signature section
    if (tag === 'img') return;

    el.childNodes.forEach((child) =>
      walk(child, isBold, isItalic, fSize, blockAlign)
    );

    // Newline after block
    if (BLOCK_TAGS.has(tag)) {
      segments.push({
        text: '\n',
        bold: false,
        italic: false,
        fontSize: fSize,
        isNewline: true,
        align: 'left'
      });
    }
  };

  doc.body.childNodes.forEach((node) => walk(node, false, false, 10, 'left'));

  return segments.filter(
    (s) => s.isNewline || s.text.trim() !== titleToExclude.trim()
  );
};

const sanitizeForPDF = (text: string): string => {
  return (
    text
      // Smart quotes → straight quotes
      .replace(/[\u2018\u2019]/g, "'") // ' ' → '
      .replace(/[\u201C\u201D]/g, '"') // " " → "
      // Dashes
      .replace(/[\u2013\u2014]/g, '-') // – — → -
      // Ellipsis
      .replace(/\u2026/g, '...') // … → ...
      // Non-breaking space
      .replace(/\u00A0/g, ' ') // &nbsp; → space
      // Any remaining non-Latin-1 characters → remove
      // Latin-1 range is 0x00-0xFF
      .replace(/[^\x00-\xFF]/g, '')
  );
};

// ─────────────────────────────────────────────────────────────────────────
const ConsentFormViewer = ({
  form,
  onFormSigned,
  pendingForms,
  onSelectForm,
  triggerRefresh,
  noForms = false
}: Props) => {
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLDivElement>(null);

  const [signatureOpen, setSignatureOpen] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  );
  const [showAllSignedMessage, setShowAllSignedMessage] = useState(false);

  const prevPendingCount = useRef<number>(0);
  const hasShownCompletionMessage = useRef<boolean>(false);

  const { decrementPendingCount, setPendingCount } = useConsentFormContext();
  const { patientId, practiceId } = useCurrentPatient();

  // ── 1. Render content ─────────────────────────────────────────────────
  useEffect(() => {
    if (!form) return;

    let updatedContent = form.Content;

    const listStyleFix = `
<style>
  .consent-form-content ul,
  .consent-form-content ul[style] {
    margin-left: 20px !important;
    padding-left: 8px !important;
    list-style-type: disc !important;
    list-style-position: outside !important;
  }
  .consent-form-content ol,
  .consent-form-content ol[style] {
    margin-left: 20px !important;
    padding-left: 8px !important;
    list-style-type: decimal !important;
    list-style-position: outside !important;
  }
  .consent-form-content li,
  .consent-form-content li[style] {
    display: list-item !important;
    margin-bottom: 4px !important;
  }
  .consent-form-content li p,
  .consent-form-content li > p {
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
  }
</style>`;

    // InputTextField replacement
    if (form.Status === 'Pending') {
      updatedContent = updatedContent.replace(
        /InputTextField/g,
        `<input type="text" data-field="dynamic" placeholder=""
        style="border:none; border-bottom:2px solid #000; outline:none;
          background:transparent; font-size:inherit; font-family:inherit;
          min-width:120px; width:120px; padding:2px 4px; display:inline-block;
          color:inherit; cursor:text;"
        oninput="this.style.width='120px'; this.style.width=Math.max(120,this.scrollWidth)+'px'"
      />`
      );
    } else {
      updatedContent = updatedContent.replace(
        /InputTextField/g,
        `<span style="border-bottom:1.5px solid #555; padding:0 4px;
        min-width:80px; display:inline-block;">&nbsp;</span>`
      );
    }

    // Signature replacement
    if (form.Signature) {
      const signatureImg = `<img src="${form.Signature}" alt="Signature"
      style="max-width:250px; height:auto; display:block; margin:4px 0;" />${
        form.SignedByName
          ? `<br/><span style="font-size:13px;font-weight:bold">
            Signed By: ${form.SignedByName}</span>`
          : ''
      }`;

      updatedContent = updatedContent.replace(
        /(\s|<br\s*\/?>|<p[^>]*>)\s*_{10,}\s*(<\/p>|<br\s*\/?>|$)/gi,
        (match, before, after) => `${before}${signatureImg}${after}`
      );

      updatedContent = updatedContent.replace(
        /((?:<\/strong>|<\/b>|<\/em>|<\/i>|\s))\s*_{10,}\s*(?=<\/p>|<br|$)/gi,
        (match, before) => `${before}${signatureImg}`
      );

      updatedContent = updatedContent.replace(/_{10,}/g, signatureImg);
    }

    updatedContent = updatedContent.replace(
      /Patient Signature:/g,
      'Signature:'
    );

    setRenderedContent(listStyleFix + updatedContent);
  }, [form]);

  // ── 2. Countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown === null || countdown <= 0 || !form?.FormID) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    if (countdown === 1) {
      setTimeout(() => {
        const remainingPending = pendingForms.filter(
          (f) => f.Status === 'Pending'
        );
        if (remainingPending.length === 0) return;

        const currentIndex = remainingPending.findIndex(
          (f) => f.FormID === form.FormID
        );
        const nextForm =
          currentIndex !== -1 && currentIndex + 1 < remainingPending.length
            ? remainingPending[currentIndex + 1]
            : remainingPending[0];

        setCountdown(null);
        if (nextForm) onSelectForm(nextForm);
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [countdown, pendingForms, form?.FormID]);

  // ── 3. All-signed completion ───────────────────────────────────────────
  useEffect(() => {
    const currentPendingCount = pendingForms.filter(
      (f) => f.Status === 'Pending'
    ).length;
    const allSigned = currentPendingCount === 0 && prevPendingCount.current > 0;

    if (allSigned && !hasShownCompletionMessage.current) {
      setShowAllSignedMessage(true);
      hasShownCompletionMessage.current = true;
      applyPendingConsentFormCount(0, setPendingCount);
      notifyConsentCountUpdated();
    }

    const timer = setTimeout(() => setShowAllSignedMessage(false), 3000);
    prevPendingCount.current = currentPendingCount;
    return () => clearTimeout(timer);
  }, [pendingForms]);

  // ── 4. Print ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (typeof window === 'undefined' || !form) return;

    const generatedAt = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const signedDate = form.SignedDate
      ? new Date(form.SignedDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });

    const cleanBodyContent = renderedContent
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<img[^>]*alt="Signature"[^>]*\/?>/gi, '')
      .replace(/<br\s*\/?><span[^>]*>Signed By:[^<]*<\/span>/gi, '')
      .replace(/_{10,}/g, '')
      .replace(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => {
        const text = inner.replace(/<[^>]*>/g, '').trim();
        return text.toLowerCase() === form.Title.trim().toLowerCase()
          ? ''
          : match;
      });

    const signatureHTML = form.Signature
      ? `<img src="${form.Signature}" alt="Signature"
          style="display:block; max-width:180px; height:auto;
            margin-top:8px; margin-bottom:4px;" />`
      : `<div class="sig-blank-line"></div>`;

    const signedByValue = form.SignedByName
      ? `<span>${form.SignedByName}</span>`
      : `<span class="blank-field">&nbsp;</span>`;

    const statusColor = form.Status === 'Signed' ? '#1a7a1a' : '#b45000';

    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${form.Title}</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          @page { size: A4 portrait; margin: 22mm 16mm 22mm 16mm; }

          html, body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            color: #111;
            background: #fff;
            line-height: 1.65;
          }

          .page-wrapper { width: 100%; max-width: 178mm; margin: 0 auto; }

          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            color: #666;
            padding-bottom: 5px;
            border-bottom: 0.5px solid #bbb;
            margin-bottom: 14px;
          }
          .print-header .doc-name    { font-weight: bold; color: #444; }
          .print-header .confidential-badge { font-size: 7.5pt; color: #888; }

          .doc-title {
            text-align: center;
            font-size: 15pt;
            font-weight: bold;
            color: #1a3c5e;
            margin-bottom: 18px;
            padding-bottom: 10px;
            border-bottom: 1.5px solid #1a3c5e;
          }

          .body-content { font-size: 10pt; line-height: 1.7; color: #111; }

          .body-content p        { margin-top: 0; margin-bottom: 8px; }
          .body-content p:last-child { margin-bottom: 0; }

          .body-content h1 { font-size: 15pt; font-weight: bold; margin: 14px 0 8px; }
          .body-content h2 { font-size: 13pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; margin: 14px 0 8px; }
          .body-content h3, .body-content h4,
          .body-content h5, .body-content h6 { font-weight: bold; margin: 12px 0 6px; }

          .body-content strong, .body-content b { font-weight: 700 !important; }
          .body-content em,     .body-content i { font-style: italic; }
          .body-content u                        { text-decoration: underline; }

          .body-content .center-align,
          .body-content [style*="text-align:center"],
          .body-content [style*="text-align: center"] { text-align: center; }
          .body-content .right-align,
          .body-content [style*="text-align:right"],
          .body-content [style*="text-align: right"]  { text-align: right; }

          .body-content ul, .body-content ol {
            margin-left: 20px !important; padding-left: 8px !important;
            margin-top: 4px !important; margin-bottom: 8px !important;
          }
          .body-content ul { list-style-type: disc !important; list-style-position: outside !important; }
          .body-content ol { list-style-type: decimal !important; list-style-position: outside !important; }
          .body-content li { display: list-item !important; margin-bottom: 4px !important; line-height: 1.65 !important; }
          .body-content li p, .body-content li > p { display: inline !important; margin: 0 !important; padding: 0 !important; }
          .body-content ul ul, .body-content ol ol,
          .body-content ul ol, .body-content ol ul {
            margin-left: 16px !important; padding-left: 8px !important;
            margin-top: 2px !important; margin-bottom: 2px !important;
          }

          .body-content * { background: transparent !important; }

          .section-divider { border: none; border-top: 1px solid #ccc; margin: 20px 0 16px 0; }

          .signature-block { page-break-inside: avoid; break-inside: avoid; }
          .sig-section-heading {
            font-size: 9.5pt; font-weight: bold; text-transform: uppercase;
            letter-spacing: 0.6px; color: #333; margin-bottom: 10px;
          }
          .sig-label    { font-size: 10pt; font-weight: bold; color: #111; margin-bottom: 6px; }
          .sig-image-wrap { min-height: 44px; margin-bottom: 12px; }
          .sig-blank-line { width: 220px; border-bottom: 1px solid #333; height: 36px; margin-bottom: 8px; }
          .blank-field    { display: inline-block; width: 160px; border-bottom: 1px solid #555; vertical-align: bottom; }

          .sig-meta-row {
            display: flex; gap: 48px; align-items: flex-start;
            margin-top: 4px; margin-bottom: 10px; flex-wrap: wrap;
          }
          .sig-meta-row .meta-col { font-size: 10pt; }
          .sig-meta-row .meta-col strong { font-weight: bold; margin-right: 4px; }

          .doc-status { font-size: 9pt; font-weight: bold; color: ${statusColor}; margin-top: 6px; margin-bottom: 4px; }

          .audit-footer {
            margin-top: 24px; padding-top: 6px;
            border-top: 0.5px solid #ddd;
            display: flex; justify-content: space-between;
            font-size: 7.5pt; color: #888;
            page-break-inside: avoid; break-inside: avoid;
          }

          @media print {
            html, body { width: 210mm; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .page-wrapper { max-width: 100%; }
            .signature-block { page-break-inside: avoid !important; break-inside: avoid !important; }
            .audit-footer    { page-break-inside: avoid !important; break-inside: avoid !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div class="print-header">
            <span class="doc-name">${form.Title}</span>
            <span class="confidential-badge">CONFIDENTIAL - Patient Medical Record</span>
          </div>

          <h1 class="doc-title">${form.Title}</h1>

          <div class="body-content">${cleanBodyContent}</div>

          <hr class="section-divider" />

          <div class="signature-block">
            <div class="sig-section-heading">Acknowledgement &amp; Signature</div>
            <div class="sig-label">Signature of Patient, Parent, or Legal Guardian:</div>
            <div class="sig-image-wrap">${signatureHTML}</div>
            <div class="sig-meta-row">
              <div class="meta-col"><strong>Signed By:</strong> ${signedByValue}</div>
              <div class="meta-col"><strong>Date:</strong> ${signedDate}</div>
            </div>
            <div class="doc-status">Document Status: ${(
              form.Status ?? 'PENDING'
            ).toUpperCase()}</div>
          </div>

          <div class="audit-footer">
            <span>Generated: ${generatedAt}</span>
            <span>CONFIDENTIAL - Patient Medical Record</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // ── 5. Download PDF ───────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!form) return;

    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = (jsPDFModule as any).jsPDF ?? jsPDFModule.default;

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const usableW = pageW - margin * 2;
      const headerH = 12;
      const footerH = 12;
      const contentTop = margin + headerH;
      const contentBottom = pageH - margin - footerH;

      const generatedAt = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const signedDate = form.SignedDate
        ? new Date(form.SignedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
          })
        : new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
          });

      const drawHeader = (pageNum: number, totalPages: number) => {
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.3);
        pdf.line(
          margin,
          margin + headerH - 1,
          pageW - margin,
          margin + headerH - 1
        );
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text(sanitizeForPDF(form.Title), margin, margin + 7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Page ${pageNum} of ${totalPages}`,
          pageW - margin,
          margin + 7,
          { align: 'right' }
        );
        pdf.setTextColor(0, 0, 0);
      };

      const drawFooter = () => {
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.3);
        pdf.line(
          margin,
          pageH - margin - footerH + 1,
          pageW - margin,
          pageH - margin - footerH + 1
        );
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);
        pdf.text(`Generated: ${generatedAt}`, margin, pageH - margin - 3);
        pdf.text(
          'CONFIDENTIAL - Patient Medical Record',
          pageW - margin,
          pageH - margin - 3,
          { align: 'right' }
        );
        pdf.setTextColor(0, 0, 0);
      };

      const cleanedHTML = renderedContent
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<img[^>]*alt="Signature"[^>]*\/?>/gi, '')
        .replace(/<br\s*\/?><span[^>]*>Signed By:[^<]*<\/span>/gi, '')
        .replace(/_{10,}/g, '')
        .replace(/\s*style="[^"]*"/gi, '')
        .replace(/\s*class="[^"]*"/gi, '');

      // ── Paragraph model ───────────────────────────────────────────────
      interface PdfChunk {
        text: string;
        bold: boolean;
        italic: boolean;
      }
      interface PdfParagraph {
        chunks: PdfChunk[];
        fontSize: number;
        align: 'left' | 'center' | 'right';
        isHeading: boolean;
      }

      const paragraphs: PdfParagraph[] = [];
      const BLOCK_TAGS = new Set([
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'li',
        'div',
        'blockquote'
      ]);

      const parseNode = (
        node: Node,
        bold: boolean,
        italic: boolean,
        fontSize: number,
        align: 'left' | 'center' | 'right',
        para: PdfParagraph | null
      ): PdfParagraph | null => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as Element).tagName.toLowerCase();
          if (tag === 'style' || tag === 'script' || tag === 'img') return para;
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent ?? '';
          if (text.trim() && para) {
            para.chunks.push({ text, bold, italic });
          }
          return para;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return para;

        const el = node as Element;
        const tag = el.tagName.toLowerCase();

        let isBold = bold;
        let isItalic = italic;
        let fSize = fontSize;
        let elAlign = align;
        let isHeading = false;

        if (tag === 'strong' || tag === 'b') isBold = true;
        if (tag === 'em' || tag === 'i') isItalic = true;

        if (tag === 'h1') {
          fSize = 16;
          isBold = true;
          isHeading = true;
        }
        if (tag === 'h2') {
          fSize = 13;
          isBold = true;
          isHeading = true;
        }
        if (tag === 'h3') {
          fSize = 12;
          isBold = true;
          isHeading = true;
        }
        if (tag === 'h4') {
          fSize = 11;
          isBold = true;
          isHeading = true;
        }

        if (tag === 'br') {
          if (para && para.chunks.length > 0) paragraphs.push(para);
          return null;
        }

        const isBlock = BLOCK_TAGS.has(tag);

        let currentPara = para;
        if (isBlock) {
          if (currentPara && currentPara.chunks.length > 0)
            paragraphs.push(currentPara);
          currentPara = {
            chunks: [],
            fontSize: fSize,
            align: elAlign,
            isHeading
          };
        }

        el.childNodes.forEach((child) => {
          currentPara = parseNode(
            child,
            isBold,
            isItalic,
            fSize,
            elAlign,
            currentPara
          );
        });

        if (isBlock) {
          if (currentPara && currentPara.chunks.length > 0)
            paragraphs.push(currentPara);
          return null;
        }

        return currentPara;
      };

      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedHTML, 'text/html');
      let activePara: PdfParagraph | null = null;

      doc.body.childNodes.forEach((node) => {
        activePara = parseNode(node, false, false, 10, 'left', activePara);
      });
      if (activePara && (activePara as PdfParagraph).chunks.length > 0) {
        paragraphs.push(activePara as PdfParagraph);
      }

      // ── Render title ──────────────────────────────────────────────────
      let y = contentTop + 6;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sanitizeForPDF(form.Title), pageW / 2, y, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      y += 14;

      // ── Render paragraphs ─────────────────────────────────────────────
      const getWordWidth = (
        word: string,
        bold: boolean,
        italic: boolean
      ): number => {
        const style =
          bold && italic
            ? 'bolditalic'
            : bold
            ? 'bold'
            : italic
            ? 'italic'
            : 'normal';
        pdf.setFont('helvetica', style);
        return pdf.getTextWidth(sanitizeForPDF(word));
      };

      for (const p of paragraphs) {
        const fullText = p.chunks
          .map((c) => c.text)
          .join('')
          .trim();
        if (!fullText) {
          y += 2;
          continue;
        }

        // ── Skip duplicate title ───────────────────────────────────────
        // Handles any heading whose text matches the form title exactly
        // Works dynamically for ALL consent forms
        if (fullText.toLowerCase() === form.Title.trim().toLowerCase())
          continue;

        const fSize = p.fontSize ?? 10;

        // Heading: render full line as bold
        if (p.isHeading) {
          y += 3;
          pdf.setFontSize(fSize);
          pdf.setFont('helvetica', 'bold');
          const xPos =
            p.align === 'center'
              ? pageW / 2
              : p.align === 'right'
              ? pageW - margin
              : margin;
          const align =
            p.align === 'center'
              ? 'center'
              : p.align === 'right'
              ? 'right'
              : 'left';
          const lines = pdf.splitTextToSize(sanitizeForPDF(fullText), usableW);
          for (const line of lines) {
            if (y + fSize * 0.45 > contentBottom) {
              pdf.addPage();
              y = contentTop + 4;
            }
            pdf.text(sanitizeForPDF(line), xPos, y, { align: align as any });
            y += fSize * 0.5;
          }
          y += 2;
          continue;
        }

        // Normal paragraph: word-level tokens for mixed bold/normal inline
        pdf.setFontSize(fSize);

        interface WordToken {
          word: string;
          bold: boolean;
          italic: boolean;
        }
        const tokens: WordToken[] = [];

        for (const chunk of p.chunks) {
          const parts = sanitizeForPDF(chunk.text).split(/(\s+)/);
          for (const part of parts) {
            if (part)
              tokens.push({
                word: part,
                bold: chunk.bold,
                italic: chunk.italic
              });
          }
        }

        // Word-wrap into visual lines
        interface RenderedWord {
          word: string;
          bold: boolean;
          italic: boolean;
        }
        const lines: RenderedWord[][] = [];
        let currentLine: RenderedWord[] = [];
        let currentLineWidth = 0;

        for (const token of tokens) {
          if (/^\s+$/.test(token.word)) {
            if (currentLine.length > 0) {
              currentLine.push(token);
              currentLineWidth += getWordWidth(' ', token.bold, token.italic);
            }
            continue;
          }

          const ww = getWordWidth(token.word, token.bold, token.italic);
          if (currentLineWidth + ww > usableW && currentLine.length > 0) {
            // Trim trailing spaces from line before pushing
            while (
              currentLine.length > 0 &&
              /^\s+$/.test(currentLine[currentLine.length - 1].word)
            ) {
              currentLine.pop();
            }
            lines.push(currentLine);
            currentLine = [];
            currentLineWidth = 0;
          }

          currentLine.push(token);
          currentLineWidth += ww;
        }

        if (currentLine.length > 0) {
          while (
            currentLine.length > 0 &&
            /^\s+$/.test(currentLine[currentLine.length - 1].word)
          ) {
            currentLine.pop();
          }
          lines.push(currentLine);
        }

        const lineH = fSize * 0.5;

        for (const rLine of lines) {
          if (y + lineH > contentBottom) {
            pdf.addPage();
            y = contentTop + 4;
          }

          if (p.align !== 'left') {
            const lineText = sanitizeForPDF(rLine.map((w) => w.word).join(''));
            const hasBold = rLine.some((w) => w.bold);
            const hasItalic = rLine.some((w) => w.italic);
            const fontStyle =
              hasBold && hasItalic
                ? 'bolditalic'
                : hasBold
                ? 'bold'
                : hasItalic
                ? 'italic'
                : 'normal';
            pdf.setFont('helvetica', fontStyle);
            pdf.text(
              lineText,
              p.align === 'center' ? pageW / 2 : pageW - margin,
              y,
              { align: p.align as any }
            );
          } else {
            let xCursor = margin;
            for (const w of rLine) {
              if (/^\s+$/.test(w.word)) {
                xCursor += getWordWidth(' ', w.bold, w.italic);
                continue;
              }
              const style =
                w.bold && w.italic
                  ? 'bolditalic'
                  : w.bold
                  ? 'bold'
                  : w.italic
                  ? 'italic'
                  : 'normal';
              pdf.setFont('helvetica', style);
              pdf.text(sanitizeForPDF(w.word), xCursor, y);
              xCursor += getWordWidth(w.word, w.bold, w.italic);
            }
          }

          y += lineH;
        }

        y += 1;
      }

      // Reset font
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      // ── Signature block ───────────────────────────────────────────────
      if (y + 62 > contentBottom) {
        pdf.addPage();
        y = contentTop + 4;
      }

      y += 6;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageW - margin, y);
      y += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACKNOWLEDGEMENT & SIGNATURE', margin, y);
      pdf.setFont('helvetica', 'normal');
      y += 7;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Signature of Patient, Parent, or Legal Guardian:', margin, y);
      pdf.setFont('helvetica', 'normal');
      y += 5;

      if (form.Signature) {
        try {
          pdf.addImage(form.Signature, 'PNG', margin, y, 60, 18);
          y += 22;
        } catch {
          pdf.text('___________________________', margin, y);
          y += 8;
        }
      } else {
        pdf.text('___________________________', margin, y);
        y += 10;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text('Signed By: ', margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        sanitizeForPDF(form.SignedByName ?? '___________________________'),
        margin + pdf.getTextWidth('Signed By: '),
        y
      );
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date: ', pageW / 2, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(signedDate, pageW / 2 + pdf.getTextWidth('Date: '), y);
      y += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(
        form.Status === 'Signed' ? 0 : 180,
        form.Status === 'Signed' ? 128 : 80,
        0
      );
      pdf.text(
        sanitizeForPDF(
          `Document Status: ${form.Status?.toUpperCase() ?? 'PENDING'}`
        ),
        margin,
        y
      );
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');

      const totalPages = (pdf.internal as any).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        drawHeader(i, totalPages);
        drawFooter();
      }

      pdf.save(`${form.Title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF download failed:', err);
      setSnackbarMessage('Failed to download PDF. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // ── 6. Signature dialog handlers ──────────────────────────────────────
  const handleOpenSignature = () => setSignatureOpen(true);
  const handleCloseSignature = () => setSignatureOpen(false);

  const handleSaveSignature = async (Signature: string) => {
    if (!form) return;

    // Capture dynamic input field values
    let finalContent = form.Content;
    if (contentRef.current) {
      const inputs = contentRef.current.querySelectorAll(
        'input[data-field="dynamic"]'
      );
      inputs.forEach((input) => {
        const value = (input as HTMLInputElement).value.trim() || '';
        finalContent = finalContent.replace('InputTextField', value);
      });
    }

    // Update rendered content replacing inputs with static spans
    if (contentRef.current) {
      const inputs = contentRef.current.querySelectorAll(
        'input[data-field="dynamic"]'
      );
      let updatedRendered = renderedContent;
      inputs.forEach((input) => {
        const value = (input as HTMLInputElement).value.trim() || '';
        updatedRendered = updatedRendered.replace(
          /<input[^>]*data-field="dynamic"[^>]*\/?>(<\/input>)?/i,
          `<span style="border-bottom:1.5px solid #555; padding:0 4px;
          font-size:inherit; font-family:inherit; display:inline-block;
          min-width:80px;">${value}</span>`
        );
      });
      setRenderedContent(updatedRendered);
    }

    const updatedForm: ConsentForm = {
      PatientID: patientId,
      ...form,
      Content: finalContent,
      Signature,
      Status: 'Signed',
      SignedDate: new Date().toISOString()
    };

    try {
      const response = await dispatch(saveConsentForm(updatedForm));
      triggerRefresh();

      if (response.payload.result === 'success') {
        setSignatureOpen(false);
        decrementPendingCount();
        setSnackbarMessage('Consent form signed successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        let finalRendered = renderedContent;
        if (contentRef.current) {
          const inputs = contentRef.current.querySelectorAll(
            'input[data-field="dynamic"]'
          );
          inputs.forEach((input) => {
            const value = (input as HTMLInputElement).value.trim() || '';
            finalRendered = finalRendered.replace(
              /<input[^>]*data-field="dynamic"[^>]*\/?>(<\/input>)?/i,
              `<span style="border-bottom:1.5px solid #555; padding:0 4px;
              font-size:inherit; font-family:inherit; display:inline-block;
              min-width:80px;">${value}</span>`
            );
          });
        }

        onFormSigned(form.FormID, Signature, finalRendered);
        setCountdown(5);

        // ── Upload PDF — existing plain text logic preserved ────────────
        let documentFile: File | null = null;
        try {
          const jsPDFModule = await import('jspdf');
          const jsPDF = (jsPDFModule as any).jsPDF ?? jsPDFModule.default;
          const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
          });

          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          const margin = 15;
          const usableWidth = pageW - margin * 2;
          const lineH = 6;
          let y = 20;

          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(sanitizeForPDF(form.Title), pageW / 2, y, {
            align: 'center'
          });
          pdf.setFont('helvetica', 'normal');
          y += 16;

          const bodyText = extractBodyText(renderedContent, form.Title);
          pdf.setFontSize(10);
          const lines: string[] = pdf.splitTextToSize(bodyText, usableWidth);

          let prevEmpty = false;
          for (const line of lines) {
            const isEmpty = line.trim() === '';
            if (isEmpty) {
              if (!prevEmpty) y += 3;
              prevEmpty = true;
              continue;
            }
            if (y + lineH > pageH - margin) {
              pdf.addPage();
              y = margin + 4;
            }
            pdf.text(line, margin, y);
            y += lineH;
            prevEmpty = false;
          }

          if (y + 60 > pageH - margin) {
            pdf.addPage();
            y = margin + 4;
          }
          y += 8;

          pdf.setFont('helvetica', 'bold');
          pdf.text(
            'Signature of Patient, Parent, or Legal Guardian:',
            margin,
            y
          );
          pdf.setFont('helvetica', 'normal');
          y += 6;

          try {
            pdf.addImage(Signature, 'PNG', margin, y, 60, 20);
            y += 26;
          } catch {
            y += 4;
          }

          if (form.SignedByName) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Signed By: ', margin, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(
              form.SignedByName,
              margin + pdf.getTextWidth('Signed By: '),
              y
            );
            y += lineH;
          }

          pdf.setFont('helvetica', 'bold');
          pdf.text('Date: ', margin, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(
            new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit'
            }),
            margin + pdf.getTextWidth('Date: '),
            y
          );

          const pdfBlob = pdf.output('blob');
          documentFile = new File(
            [pdfBlob],
            `${form.Title.replace(/\s+/g, '_')}.pdf`,
            { type: 'application/pdf' }
          );
        } catch (err) {
          console.error('PDF generation for upload failed:', err);
        }

        try {
          await dispatch(
            uploadAndSaveConsentFormDocument({
              patientId: patientId ?? '',
              practiceId: practiceId ?? '',
              title: form.Title,
              documentFile
            })
          );
        } catch {
          setSnackbarMessage('Form signed, but document upload failed.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } else {
        setSnackbarMessage(response.payload.result);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch {
      setSnackbarMessage('Something went wrong while saving.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // ── 7. Empty states ───────────────────────────────────────────────────
  if (!form) {
    if (noForms) return <Box height="100%" />;
    return (
      <Box
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="text.secondary"
      >
        <Typography variant="body1">Please select a form to view.</Typography>
      </Box>
    );
  }

  // ── 8. Render ─────────────────────────────────────────────────────────
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid #ddd',
            bgcolor: 'background.paper',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
            flexShrink: 0
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {form.Title}
          </Typography>
          <Box>
            {form.Status === 'Signed' && (
              <Button
                onClick={handleDownloadPDF}
                size="small"
                startIcon={<DownloadIcon />}
                sx={{ mr: 1 }}
              >
                Download PDF
              </Button>
            )}
            <Button
              onClick={handlePrint}
              size="small"
              startIcon={<PrintIcon />}
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Scrollable content */}
        <Box
          ref={contentRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: 3,
            py: 2,
            background: 'linear-gradient(to right, #fefefe, #f5f7fa)',
            borderRadius: 2,
            position: 'relative',

            '& p, & h1, & h2, & h3, & h4, & h5, & h6': { textAlign: 'unset' },
            '& [style*="text-align: center"]': {
              textAlign: 'center !important'
            },
            '& [style*="text-align: right"]': {
              textAlign: 'right  !important'
            },
            '& [style*="text-align: left"]': { textAlign: 'left   !important' },
            '& [style*="text-align:center"]': {
              textAlign: 'center !important'
            },
            '& [style*="text-align:right"]': { textAlign: 'right  !important' },
            '& [style*="text-align:left"]': { textAlign: 'left   !important' },
            '& .center-align, & .text-center': {
              textAlign: 'center !important'
            },
            '& .right-align,  & .text-right': {
              textAlign: 'right  !important'
            },
            '& .left-align,   & .text-left': { textAlign: 'left   !important' },

            '& ul, & ol': {
              marginLeft: '20px !important',
              paddingLeft: '8px  !important',
              marginTop: '4px  !important',
              marginBottom: '8px  !important'
            },
            '& ul': {
              listStyleType: 'disc    !important',
              listStylePosition: 'outside !important'
            },
            '& ol': {
              listStyleType: 'decimal !important',
              listStylePosition: 'outside !important'
            },
            '& li': {
              display: 'list-item !important',
              marginBottom: '4px !important',
              lineHeight: '1.65 !important'
            },
            '& li p, & li > p': {
              display: 'inline !important',
              margin: '0 !important',
              padding: '0 !important'
            },
            '& ul ul, & ol ol, & ul ol, & ol ul': {
              marginLeft: '16px !important',
              paddingLeft: '8px !important',
              marginTop: '2px  !important',
              marginBottom: '2px !important'
            }
          }}
        >
          <div
            className="consent-form-content"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid #ddd',
            bgcolor: 'background.paper',
            flexShrink: 0,
            zIndex: 2,
            textAlign: 'right'
          }}
        >
          {form.Status === 'Pending' && (
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: '5px' }}
              onClick={handleOpenSignature}
            >
              Sign
            </Button>
          )}
        </Box>
      </Box>

      {/* Countdown overlay */}
      {countdown !== null &&
        countdown > 0 &&
        pendingForms.some((f) => f.Status === 'Pending') && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'white',
              opacity: 0.95,
              color: '#1976d2',
              p: 4,
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
              textAlign: 'center',
              zIndex: 1300,
              minWidth: 300,
              pointerEvents: 'none'
            }}
          >
            <Typography variant="body1" fontWeight={500}>
              Loading the next consent form in
            </Typography>
            <Typography
              variant="h2"
              sx={{ mt: 1, animation: `${bounce} 1s ease-in-out infinite` }}
            >
              {countdown}
            </Typography>
          </Box>
        )}

      {/* All-signed message */}
      {showAllSignedMessage && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            opacity: 0.95,
            color: 'green',
            p: 4,
            borderRadius: 3,
            boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
            textAlign: 'center',
            zIndex: 1300,
            minWidth: 300,
            transition: 'opacity 0.5s ease-in-out',
            pointerEvents: 'none'
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            🎉 You have completed all pending consent forms!
          </Typography>
        </Box>
      )}

      <SignatureDialog
        open={signatureOpen}
        onClose={handleCloseSignature}
        onSave={handleSaveSignature}
      />

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConsentFormViewer;
