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

// ── extractBodyText — plain text fallback ─────────────────────────────────
const extractBodyText = (html: string, titleToExclude: string): string => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return parsed.body.innerText
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && l !== titleToExclude.trim())
    .join('\n');
};

// ── sanitizeForPDF ────────────────────────────────────────────────────────
const sanitizeForPDF = (text: string): string =>
  text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x00-\xFF]/g, '');

const cleanHTMLForExport = (html: string, formTitle: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/_{10,}/g, '')
    .replace(
      /<span\s[^>]*style="[^"]*font-weight\s*:\s*bold[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
      '<strong>$1</strong>'
    )
    .replace(
      /<span\s[^>]*style="[^"]*font-weight\s*:\s*700[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
      '<strong>$1</strong>'
    )
    .replace(/\s*style="[^"]*"/gi, '')
    .replace(/\s*class="[^"]*"/gi, '')
    .replace(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim();
      return text.toLowerCase() === formTitle.trim().toLowerCase() ? '' : match;
    });

// ── PDF paragraph model ───────────────────────────────────────────────────
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
  isImage?: boolean;
  imageDataUrl?: string;
}

// ── generateFormattedPDF ──────────────────────────────────────────────────
// Shared PDF generation pipeline — used by BOTH handleDownloadPDF AND
// the upload-on-sign flow so Document Viewer shows identical output.
// The signature image and Signed By span remain embedded in the form body
// at the location of the original underscore placeholder.
export const generateFormattedPDF = async (
  formData: ConsentForm & { Signature?: string; SignedByName?: string },
  htmlContent: string,
  _signatureDataUrl?: string
): Promise<Blob> => {
  const jsPDFModule = await import('jspdf');
  const jsPDF = (jsPDFModule as any).jsPDF ?? jsPDFModule.default;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

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


  // ── Header / Footer ───────────────────────────────────────────────────
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
    pdf.text(sanitizeForPDF(formData.Title), margin, margin + 7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${pageNum} of ${totalPages}`, pageW - margin, margin + 7, {
      align: 'right'
    });
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

  const cleanedHTML = cleanHTMLForExport(htmlContent, formData.Title);

  // ── Parse HTML into paragraph model ──────────────────────────────────
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
      const t = (node as Element).tagName.toLowerCase();
      if (t === 'style' || t === 'script') return para;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (text.trim() && para) para.chunks.push({ text, bold, italic });
      return para;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return para;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    let isBold = bold,
      isItalic = italic,
      fSize = fontSize,
      elAlign = align,
      isHeading = false;

    if (tag === 'strong' || tag === 'b') isBold = true;
    if (tag === 'em' || tag === 'i') isItalic = true;

    // Inline style detection — safety net after span→strong conversion
    const sa = el.getAttribute('style') ?? '';
    if (
      sa.includes('font-weight:bold') ||
      sa.includes('font-weight: bold') ||
      sa.includes('font-weight:700') ||
      sa.includes('font-weight: 700')
    )
      isBold = true;
    if (sa.includes('font-style:italic') || sa.includes('font-style: italic'))
      isItalic = true;

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
      return { chunks: [], fontSize: fSize, align: elAlign, isHeading: false };
    }
    if (tag === 'img') {
      const src = el.getAttribute('src') ?? '';
      if (src) {
        if (para && para.chunks.length > 0) paragraphs.push(para);
        paragraphs.push({
          chunks: [],
          fontSize: fSize,
          align: elAlign,
          isHeading: false,
          isImage: true,
          imageDataUrl: src
        });
      }
      return { chunks: [], fontSize: fSize, align: elAlign, isHeading: false };
    }

    const isBlock = BLOCK_TAGS.has(tag);
    let currentPara = para;
    if (isBlock) {
      if (currentPara && currentPara.chunks.length > 0)
        paragraphs.push(currentPara);
      currentPara = { chunks: [], fontSize: fSize, align: elAlign, isHeading };
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
  if (activePara && (activePara as PdfParagraph).chunks.length > 0)
    paragraphs.push(activePara as PdfParagraph);

  // ── Render title ──────────────────────────────────────────────────────
  let y = contentTop + 6;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(sanitizeForPDF(formData.Title), pageW / 2, y, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  y += 14;

  // ── Word-width helper ─────────────────────────────────────────────────
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

  // ── Render paragraphs ─────────────────────────────────────────────────
  for (const p of paragraphs) {
    // Non-signature image (e.g. letterhead logo)
    if (p.isImage && p.imageDataUrl) {
      if (y + 22 > contentBottom) {
        pdf.addPage();
        y = contentTop + 4;
      }
      try {
        pdf.addImage(p.imageDataUrl, 'PNG', margin, y, 60, 18);
        y += 22;
      } catch {
        y += 4;
      }
      continue;
    }

    const fullText = p.chunks
      .map((c) => c.text)
      .join('')
      .trim();
    if (!fullText) {
      y += 2;
      continue;
    }

    // Skip duplicate title (already rendered above)
    if (fullText.toLowerCase() === formData.Title.trim().toLowerCase())
      continue;

    const fSize = p.fontSize ?? 10;

    // Heading paragraph
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

    // Normal paragraph — word-level tokens for mixed bold/italic inline
    pdf.setFontSize(fSize);
    interface WordToken {
      word: string;
      bold: boolean;
      italic: boolean;
    }
    const tokens: WordToken[] = [];
    for (const chunk of p.chunks) {
      const parts = sanitizeForPDF(chunk.text).split(/(\s+)/);
      for (const part of parts)
        if (part)
          tokens.push({ word: part, bold: chunk.bold, italic: chunk.italic });
    }

    // Word-wrap tokens into visual lines
    interface RenderedWord {
      word: string;
      bold: boolean;
      italic: boolean;
    }
    const lines: RenderedWord[][] = [];
    let currentLine: RenderedWord[] = [],
      currentLineWidth = 0;

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
        while (
          currentLine.length > 0 &&
          /^\s+$/.test(currentLine[currentLine.length - 1].word)
        )
          currentLine.pop();
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
      )
        currentLine.pop();
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

  // ── Header + footer on every page ────────────────────────────────────
  const totalPages = (pdf.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    drawHeader(i, totalPages);
    drawFooter();
  }

  return pdf.output('blob');
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
  const isSubmittingRef = useRef<boolean>(false);

  const { decrementPendingCount, setPendingCount } = useConsentFormContext();
  const { patientId, practiceId, firstName, lastName } = useCurrentPatient();

  // ── 1. Render content ─────────────────────────────────────────────────
  useEffect(() => {
    if (!form) return;
    let updatedContent = form.Content;

    const listStyleFix = `
<style>
  .consent-form-content ul,
  .consent-form-content ul[style] {
    margin-left: 20px !important; padding-left: 8px !important;
    list-style-type: disc !important; list-style-position: outside !important;
  }
  .consent-form-content ol,
  .consent-form-content ol[style] {
    margin-left: 20px !important; padding-left: 8px !important;
    list-style-type: decimal !important; list-style-position: outside !important;
  }
  .consent-form-content li,
  .consent-form-content li[style] { display: list-item !important; margin-bottom: 4px !important; }
  .consent-form-content li p,
  .consent-form-content li > p { display: inline !important; margin: 0 !important; padding: 0 !important; }
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
        `<span style="border-bottom:1.5px solid #555; padding:0 4px; min-width:80px; display:inline-block;">&nbsp;</span>`
      );
    }

    // Signature replacement — embeds image + Signed By into body
    if (form.Signature) {
      const signatureImg = `<img src="${form.Signature}" alt="Signature"
      style="max-width:250px; height:auto; display:block; margin:4px 0;" />${
        form.SignedByName
          ? `<br/><span style="font-size:13px;font-weight:bold">Signed By: ${form.SignedByName}</span>`
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
    const timer = setTimeout(
      () => setCountdown((prev) => (prev !== null ? prev - 1 : null)),
      1000
    );
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
  // Renders form body AS-IS — no duplicate acknowledgement block appended.
  // The signature image, Signed By, and all patient details are already
  // embedded in renderedContent by the useEffect signature replacement.
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

    // Use shared cleaner — preserves all body content, removes only style/script/title dups
    const cleanBodyContent = cleanHTMLForExport(renderedContent, form.Title);

    const statusColor = form.Status === 'Signed' ? '#1a7a1a' : '#b45000';

    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${form.Title}</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          @page { size: A4 portrait; margin: 0; }
          html, body { font-family: Arial, sans-serif; font-size: 10pt; color: #111; background: #fff; line-height: 1.65; }
          .page-wrapper { width: 100%; max-width: 178mm; margin: 0 auto; padding-top: 22mm; padding-bottom: 22mm; }

          .print-header { display: flex; justify-content: space-between; align-items: center; font-size: 8pt; color: #666; padding-bottom: 5px; border-bottom: 0.5px solid #bbb; margin-bottom: 14px; }
          .print-header .doc-name { font-weight: bold; color: #444; }
          .print-header .confidential-badge { font-size: 7.5pt; color: #888; }

          .doc-title { text-align: center; font-size: 15pt; font-weight: bold; color: #1a3c5e; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1.5px solid #1a3c5e; }

          .body-content { font-size: 10pt; line-height: 1.7; color: #111; }
          .body-content p { margin-top: 0; margin-bottom: 8px; }
          .body-content p:last-child { margin-bottom: 0; }
          .body-content h1 { font-size: 15pt; font-weight: bold; margin: 14px 0 8px; }
          .body-content h2 { font-size: 13pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; margin: 14px 0 8px; }
          .body-content h3, .body-content h4, .body-content h5, .body-content h6 { font-weight: bold; margin: 12px 0 6px; }
          .body-content strong, .body-content b { font-weight: 700 !important; }
          .body-content em, .body-content i { font-style: italic; }
          .body-content u { text-decoration: underline; }
          .body-content .center-align, .body-content [style*="text-align:center"], .body-content [style*="text-align: center"] { text-align: center; }
          .body-content .right-align,  .body-content [style*="text-align:right"],  .body-content [style*="text-align: right"]  { text-align: right; }
          .body-content ul, .body-content ol { margin-left: 20px !important; padding-left: 8px !important; margin-top: 4px !important; margin-bottom: 8px !important; }
          .body-content ul { list-style-type: disc    !important; list-style-position: outside !important; }
          .body-content ol { list-style-type: decimal !important; list-style-position: outside !important; }
          .body-content li { display: list-item !important; margin-bottom: 4px !important; line-height: 1.65 !important; }
          .body-content li p, .body-content li > p { display: inline !important; margin: 0 !important; padding: 0 !important; }
          .body-content ul ul, .body-content ol ol, .body-content ul ol, .body-content ol ul { margin-left: 16px !important; padding-left: 8px !important; margin-top: 2px !important; margin-bottom: 2px !important; }
          .body-content * { background: transparent !important; }

          /* Signature image within body content */
          .body-content img { max-width: 250px; height: auto; display: block; margin: 4px 0; }

          .audit-footer { margin-top: 24px; padding-top: 6px; border-top: 0.5px solid #ddd; display: flex; justify-content: space-between; font-size: 7.5pt; color: #888; page-break-inside: avoid; break-inside: avoid; }

          @media print {
            html, body { width: 210mm; print-color-adjust: exact; -webkit-print-color-adjust: exact; height: auto !important; overflow: hidden !important; }
            .page-wrapper { max-width: 100%; }
            .audit-footer { page-break-inside: avoid !important; break-inside: avoid !important; }
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

          <!-- Form body contains complete content: signature image, Signed By,
               patient details — exactly matching the Patient Portal view -->
          <div class="body-content">${cleanBodyContent}</div>

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
  // Uses shared generateFormattedPDF — identical output to Document Viewer.
  // No separate acknowledgement block — form body is the source of truth.
  const handleDownloadPDF = async () => {
    if (!form) return;
    try {
      const pdfBlob = await generateFormattedPDF(
        form,
        renderedContent,
        form.Signature ?? ''
      );
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.Title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
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
    if (!form || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Capture dynamic input values BEFORE any await (DOM inputs still exist)
    let finalContent = form.Content;
    let updatedRendered = renderedContent;
    if (contentRef.current) {
      const inputs = contentRef.current.querySelectorAll(
        'input[data-field="dynamic"]'
      );
      inputs.forEach((input) => {
        const value = (input as HTMLInputElement).value.trim() || '';
        finalContent = finalContent.replace('InputTextField', value);
        updatedRendered = updatedRendered.replace(
          /<input[^>]*data-field="dynamic"[^>]*\/?>(<\/input>)?/i,
          `<span style="border-bottom:1.5px solid #555; padding:0 4px; font-size:inherit; font-family:inherit; display:inline-block; min-width:80px;">${value}</span>`
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

      if (response.payload.result === 'success') {
        setSignatureOpen(false);
        decrementPendingCount();
        setSnackbarMessage('Consent form signed successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        onFormSigned(form.FormID, Signature, updatedRendered);
        triggerRefresh();
        setCountdown(5);

        // ── Upload PDF — uses shared generateFormattedPDF ─────────────
        // Produces identical output to Download PDF so Document Viewer
        // shows the same formatted content (no þÿ, correct bold, header/footer,
        // and no duplicate acknowledgement block)
        let documentFile: File | null = null;
        try {
          const patientFullName =
            firstName && lastName
              ? `${firstName} ${lastName}`
              : firstName ?? lastName ?? null;
          const signedByName = form.SignedByName ?? patientFullName;
          const signatureImg = `<img src="${Signature}" alt="Signature"
      style="max-width:250px; height:auto; display:block; margin:4px 0;" />${
        signedByName
          ? `<br/><span style="font-size:13px;font-weight:bold">Signed By: ${signedByName}</span>`
          : ''
      }`;
          let htmlForPDF = updatedRendered;
          htmlForPDF = htmlForPDF.replace(
            /(\s|<br\s*\/?>|<p[^>]*>)\s*_{10,}\s*(<\/p>|<br\s*\/?>|$)/gi,
            (match, before, after) => `${before}${signatureImg}${after}`
          );
          htmlForPDF = htmlForPDF.replace(
            /((?:<\/strong>|<\/b>|<\/em>|<\/i>|\s))\s*_{10,}\s*(?=<\/p>|<br|$)/gi,
            (match, before) => `${before}${signatureImg}`
          );
          htmlForPDF = htmlForPDF.replace(/_{10,}/g, signatureImg);
          const pdfBlob = await generateFormattedPDF(
            {
              ...form,
              Signature,
              Status: 'Signed',
              SignedDate: new Date().toISOString(),
              SignedByName: signedByName
            },
            htmlForPDF,
            Signature
          );
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
    } finally {
      isSubmittingRef.current = false;
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
              paddingLeft: '8px !important',
              marginTop: '4px !important',
              marginBottom: '8px !important'
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
              marginTop: '2px !important',
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
