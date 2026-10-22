import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  CircularProgress,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { getAllSelectedDocuments } from '@/slices/patientprofileslice';
import DocViewer, {
  DocViewerRenderers,
  DocViewerRef
} from '@cyntler/react-doc-viewer';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';

import axios from 'axios';
export const BASEURLV2 = process.env.NEXT_PUBLIC_APP_API_PATH_V2;
export const getToken = () =>
  localStorage.getItem('token') ? localStorage.getItem('token') : null;
import { generateFormattedPDF } from '@/components/ConsentForms/components/ConsentFormViewer';

interface AssignedUser {
  userId: string;
  userName: string;
  fullName: string;
}

interface Document {
  id: string;
  documentSubTypeName: string;
  documentName: string;
  assignedUsers: AssignedUser[];
  assignedByUserName: string;
  date: string;
  documentUri: string;
}

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  txt: 'text/plain',
  rtf: 'application/rtf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

const PREVIEWABLE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff'
];

// Word-type files rendered to HTML in the browser (rtf.js / docx-preview)
// instead of the doc viewer's MS Office renderer, which needs a public URL.
const HTML_RENDERED_MIME_TYPES = [
  'application/rtf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

type HtmlDocKind = 'rtf' | 'docx';

// Detect the real format from the file's first bytes; .doc files are often
// RTF or DOCX saved with a .doc extension.
const detectHtmlDocKind = async (blob: Blob): Promise<HtmlDocKind | null> => {
  const bytes = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
  const head = String.fromCharCode(...Array.from(bytes));
  if (head.startsWith('{\\rtf')) return 'rtf';
  if (head.startsWith('PK')) return 'docx';
  return null; // e.g. legacy binary .doc (D0 CF 11 E0) - no browser renderer
};

interface BodyProps {
  dateRange: string;
  selectedTypeId: number | null;
}

const DocumentsBody: React.FC<BodyProps> = ({ dateRange, selectedTypeId }) => {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDoc, setMenuDoc] = useState<Document | null>(null);

  const [docLoading, setDocLoading] = useState(false);
  const [openViewerDialog, setOpenViewerDialog] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docType, setDocType] = useState<string>('');

  const [htmlDoc, setHtmlDoc] = useState<{
    kind: HtmlDocKind;
    blob: Blob;
  } | null>(null);

  const viewerRef = useRef<DocViewerRef>(null);
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  const { patientId, practiceId } = useCurrentPatient();

  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getDateRange = (range: string) => {
    const to = new Date();
    let from = new Date();

    switch (range) {
      case '1m':
        from.setMonth(to.getMonth() - 1);
        break;
      case '6m':
        from.setMonth(to.getMonth() - 6);
        break;
      case '1y':
        from.setFullYear(to.getFullYear() - 1);
        break;
      case '2y':
        from.setFullYear(to.getFullYear() - 2);
        break;
      case '3y':
        from.setFullYear(to.getFullYear() - 3);
        break;
      default:
        from = new Date(2000, 0, 1);
    }

    return {
      fromDate: from.toISOString().split('T')[0],
      toDate: to.toISOString().split('T')[0]
    };
  };

  // Cleanup ObjectURL on unmount or when docUrl changes
  useEffect(() => {
    return () => {
      if (docUrl) URL.revokeObjectURL(docUrl);
    };
  }, [docUrl]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTypeId) {
        setDocuments([]);
        return;
      }

      setLoading(true);
      try {
        const { fromDate, toDate } = getDateRange(dateRange);

        const Obj = {
          patientId: patientId,
          practiceId: practiceId,
          documentTypeId: selectedTypeId,
          fromDate: fromDate,
          toDate: toDate
        };
        const response = await dispatch(getAllSelectedDocuments(Obj)).unwrap();
        setDocuments(response.result || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, selectedTypeId, dateRange]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    doc: Document
  ) => {
    setMenuDoc(null);

    setAnchorEl(event.currentTarget);
    setMenuDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Extension is taken from documentUri (the stored file name); documentName is
  // a user-entered title and usually has no extension.
  const getExtension = (fileName: string = ''): string => {
    const name = fileName.split('?')[0].split('/').pop() || '';
    return name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
  };

  const getMimeTypeFromExtension = (fileName: string): string => {
    return MIME_TYPES[getExtension(fileName)] || 'application/octet-stream';
  };

  // Types the doc viewer can render from a blob URL. DOC/DOCX/RTF are not in
  // this list: its MS Office renderer needs a publicly reachable URL and fails
  // (blank/crashed iframe) with a blob URL, so they are rendered to HTML.
  const isPreviewable = (mimeType: string) =>
    PREVIEWABLE_MIME_TYPES.includes(mimeType);

  const isHtmlRendered = (mimeType: string) =>
    HTML_RENDERED_MIME_TYPES.includes(mimeType);

  // Render RTF/DOCX into the viewer once the file is fetched
  useEffect(() => {
    const container = htmlContainerRef.current;
    if (!htmlDoc || !container) return;

    let cancelled = false;
    container.innerHTML = '';

    const render = async () => {
      try {
        if (htmlDoc.kind === 'rtf') {
          const { RTFJS } = await import('rtf.js');
          RTFJS.loggingEnabled(false);
          const rtfDoc = new RTFJS.Document(
            await htmlDoc.blob.arrayBuffer(),
            {}
          );
          const elements = await rtfDoc.render();
          if (!cancelled) container.append(...elements);
        } else {
          const { renderAsync } = await import('docx-preview');
          if (!cancelled) await renderAsync(htmlDoc.blob, container, container);
        }
      } catch (err) {
        console.error('Error rendering document:', err);
        if (!cancelled) {
          setHtmlDoc(null);
          setDocType('application/octet-stream');
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [htmlDoc]);

  const fetchDocumentBlob = async (doc: Document): Promise<Blob> => {
    const response = await axios({
      url:
        BASEURLV2 +
        `patientportal/downloadpatientdocument?fileName=${doc.documentUri}`,
      method: 'GET',
      responseType: 'blob',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    // Re-type the blob so the browser/viewer knows the real format
    // (the API may return application/octet-stream).
    return new Blob([response.data], {
      type: getMimeTypeFromExtension(doc.documentUri)
    });
  };

  const handleView = async () => {
    if (!menuDoc) return;

    const mimeType = getMimeTypeFromExtension(menuDoc.documentUri);
    setDocType(mimeType);
    setDocUrl(null);
    setHtmlDoc(null);
    setOpenViewerDialog(true);
    if (!isPreviewable(mimeType) && !isHtmlRendered(mimeType)) return;

    setDocLoading(true);
    try {
      const blob = await fetchDocumentBlob(menuDoc);
      if (isHtmlRendered(mimeType)) {
        const kind = await detectHtmlDocKind(blob);
        if (kind) setHtmlDoc({ kind, blob });
        else setDocType('application/octet-stream');
      } else {
        setDocUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error('Error viewing document:', err);
    } finally {
      setDocLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!menuDoc) return;

    try {
      const blob = await fetchDocumentBlob(menuDoc);
      const url = URL.createObjectURL(blob);

      // ensure filename has the original file's extension
      const ext = getExtension(menuDoc.documentUri);
      const extension = ext ? `.${ext}` : '';
      const fileName =
        !extension ||
        menuDoc.documentName.toLowerCase().endsWith(extension)
          ? menuDoc.documentName
          : menuDoc.documentName + extension;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  // Prints through a hidden iframe instead of opening the blob URL in a new
  // tab, so the browser's print header/footer don't show the blob URL.
  const handlePrint = () => {
    const htmlContent = htmlDoc ? htmlContainerRef.current?.innerHTML : null;
    if (!htmlContent && (!docUrl || !isPreviewable(docType))) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    const title = (menuDoc?.documentName || 'Document').replace(
      /[<>&"]/g,
      ''
    );

    const cleanup = () => setTimeout(() => iframe.remove(), 1000);
    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) return;
      win.addEventListener('afterprint', cleanup);
      win.focus();
      win.print();
    };

    if (htmlContent) {
      // RTF/DOCX: print the HTML already rendered in the viewer. margin: 0 on
      // @page leaves no room for the browser's header/footer.
      iframe.srcdoc = `<!doctype html><html><head><title>${title}</title>
        <style>
          @page { size: auto; margin: 0; }
          html, body { margin: 0; padding: 0; }
          body { padding: 12mm; box-sizing: border-box; }
          .docx-wrapper { background: none !important; padding: 0 !important; }
          .docx-wrapper > section.docx { box-shadow: none !important; margin: 0 auto !important; }
        </style></head>
        <body>${htmlContent}</body></html>`;
    } else if (docType === 'application/pdf') {
      // The browser's PDF viewer prints the PDF itself without page headers.
      iframe.src = docUrl!;
    } else {
      // Browsers can't display TIFF in <img>; reuse the viewer's rendered canvas.
      const tiffCanvas = document.getElementById(
        'tiff-img'
      ) as HTMLCanvasElement | null;
      const imgSrc =
        docType === 'image/tiff' && tiffCanvas
          ? tiffCanvas.toDataURL('image/png')
          : docUrl;
      // margin: 0 on @page leaves no room for the browser's header/footer.
      iframe.srcdoc = `<!doctype html><html><head><title>${title}</title>
        <style>
          @page { size: auto; margin: 0; }
          html, body { margin: 0; padding: 0; }
          body { padding: 12mm; box-sizing: border-box; }
          img { display: block; max-width: 100%; max-height: 100vh; margin: 0 auto; object-fit: contain; }
        </style></head>
        <body><img src="${imgSrc}" /></body></html>`;
    }

    document.body.appendChild(iframe);
  };

  const handleDialogClose = () => {
    setOpenViewerDialog(false);
    handleMenuClose();
  };

  const renderMessage = (text: string) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
        width: '100%'
      }}
    >
      <Typography variant="h4" component="h4" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );

  const columns: GridColDef[] = [
    { field: 'documentSubTypeName', headerName: 'Document Type', flex: 1 },
    { field: 'documentName', headerName: 'Document Name', flex: 1 },
    {
      field: 'assignedUsers',
      headerName: 'Assigned To',
      flex: 1,
      valueGetter: (params) =>
        params.row.assignedUsers?.length > 0
          ? params.row.assignedUsers[0].fullName
          : ''
    },
    { field: 'assignedByUserName', headerName: 'Assigned By', flex: 1 },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (params) =>
        params.value ? moment(params.value).format('MM/DD/YYYY') : ''
    },
    {
      field: 'actions',
      headerName: 'Action',
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      width: 100,
      minWidth: 80,
      flex: 0,
      renderCell: (params) => (
        <IconButton
          aria-label={`Actions for ${params.row.documentName}`}
          onClick={(e) => handleMenuOpen(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  if (!selectedTypeId) {
    return renderMessage('Please select a Document Type to show Documents');
  }

  if (loading) {
    return renderMessage('Loading documents...');
  }

  if (documents.length === 0) {
    return renderMessage(
      'No Documents found against the selected Document Type'
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', p: 1 }}>
      <DataGrid
        rows={documents}
        columns={columns}
        getRowId={(row) => row.id}
        autoPageSize
        pageSize={10}
        columnVisibilityModel={
          isNarrow
            ? {
                documentSubTypeName: false,
                assignedUsers: false,
                assignedByUserName: false
              }
            : undefined
        }
        sx={{
          '.MuiDataGrid-columnSeparator': { display: 'none' },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#ededeb',
            fontStyle: 'italic'
          },
          boxShadow: 2,
          borderRadius: 2
        }}
        disableSelectionOnClick
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>View</MenuItem>
        <MenuItem onClick={handleDownload}>Download</MenuItem>
      </Menu>

      {/* Viewer Dialog */}
      <Dialog
        open={openViewerDialog}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        fullScreen={typeof window !== 'undefined' && window.innerWidth < 600}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderBottom: '1px solid #ddd'
          }}
        >
          <Typography
            variant="h4"
            noWrap
            sx={{ fontSize: { xs: '1rem', sm: '1.5rem', md: '2.125rem' } }}
          >
            {'Document Viewer: ' + menuDoc?.documentName}
          </Typography>
          <IconButton onClick={handleDialogClose} sx={{ flexShrink: 0 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            height: { xs: 'calc(100vh - 120px)', sm: '90vh' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 1, sm: 2 }
          }}
        >
          {!isPreviewable(docType) && !isHtmlRendered(docType) ? (
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              Preview is not available for this file type. Please download the
              document to view it.
            </Typography>
          ) : htmlDoc ? (
            <Box
              ref={htmlContainerRef}
              sx={{
                alignSelf: 'stretch',
                width: '100%',
                height: '100%',
                overflow: 'auto',
                bgcolor: '#fff',
                p: 2
              }}
            />
          ) : docLoading || !docUrl ? (
            <CircularProgress />
          ) : (
            <DocViewer
              ref={viewerRef}
              documents={[
                {
                  uri: docUrl,
                  fileType: docType,
                  fileName: menuDoc?.documentName
                }
              ]}
              pluginRenderers={DocViewerRenderers}
              style={{
                width: '100%',
                height: '100%',
                padding: '0px 10px 0px 10px'
              }}
              config={{
                header: {
                  disableFileName: true,
                  disableHeader: true,
                  retainURLParams: false
                },
                loadingRenderer: {
                  showLoadingTimeout: false
                },
                pdfZoom: {
                  defaultZoom: 1,
                  zoomJump: 0.4
                },
                pdfVerticalScrollByDefault: true
              }}
            />
          )}
        </DialogContent>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderTop: '1px solid #ddd',
            gap: 2
          }}
        >
          <Button
            variant="outlined"
            onClick={handlePrint}
            disabled={!htmlDoc && (!isPreviewable(docType) || !docUrl)}
            sx={{ borderRadius: '5px' }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            onClick={handleDownload}
            sx={{ borderRadius: '5px' }}
          >
            Download
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default DocumentsBody;
