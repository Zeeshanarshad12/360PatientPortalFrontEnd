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

import axios from 'axios';
export const BASEURLV2 = process.env.NEXT_PUBLIC_APP_API_PATH_V2;
export const getToken = () =>
  localStorage.getItem('token') ? localStorage.getItem('token') : null;

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

  const viewerRef = useRef<DocViewerRef>(null);

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
          patientId: localStorage.getItem('patientID'),
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

  const getMimeTypeFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  };

  const handleView = async () => {
    if (!menuDoc) return;

    setDocLoading(true);
    try {
      const mimeType = getMimeTypeFromExtension(menuDoc?.documentUri);

      await axios({
        url:
          BASEURLV2 +
          `patientportal/downloadpatientdocument?fileName=${menuDoc?.documentUri}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
        .then((response) => {
          const imageUrl = URL.createObjectURL(response.data);

          setDocUrl(imageUrl);
          setDocType(mimeType);
          setOpenViewerDialog(true);
        })
        .catch((err) => {
          console.error('Error viewing document:', err);
        })
        .finally(() => {
          setDocLoading(false);
        });
    } catch (error) {
      console.error('Error viewing document:', error);
    } finally {
      setDocLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!menuDoc) return;

    try {
      const mimeType = getMimeTypeFromExtension(menuDoc?.documentUri);

      await axios({
        url:
          BASEURLV2 +
          `patientportal/downloadpatientdocument?fileName=${menuDoc?.documentUri}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
        .then((response) => {
          const blob = new Blob([response.data], { type: mimeType });
          const url = URL.createObjectURL(blob);

          // infer extension from MIME type
          let extension = '';
          switch (mimeType) {
            case 'application/pdf':
              extension = '.pdf';
              break;
            case 'image/png':
              extension = '.png';
              break;
            case 'image/jpeg':
              extension = '.jpg';
              break;
            default:
              extension = '';
          }

          // ensure filename has extension
          const fileName = menuDoc.documentName.endsWith(extension)
            ? menuDoc.documentName
            : menuDoc.documentName + extension;

          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();

          URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.error('Error downloading document:', err);
        })
        .finally(() => {
          //handleMenuClose();
        });
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      //handleMenuClose();
    }
  };

  const handlePrint = async () => {
    if (!menuDoc) return;

    try {
      const mimeType = getMimeTypeFromExtension(menuDoc?.documentUri);

      await axios({
        url:
          BASEURLV2 +
          `patientportal/downloadpatientdocument?fileName=${menuDoc?.documentUri}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
        .then((response) => {
          const blob = new Blob([response.data], { type: mimeType });
          const url = URL.createObjectURL(blob);

          const printWindow = window.open(url, '_blank');
          printWindow?.print();

          URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.error('Error downloading document:', err);
        })
        .finally(() => {
        });
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
    }
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
        <IconButton aria-label={`Actions for ${params.row.documentName}`} onClick={(e) => handleMenuOpen(e, params.row)}>
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
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderBottom: '1px solid #ddd'
          }}
        >
          <Typography variant="h4" noWrap>
            {'Document Viewer: ' + menuDoc?.documentName }
          </Typography>
          <IconButton onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            height: '90vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {docLoading || !docUrl ? (
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
              style={{ width: '100%', height: '100%', padding: "0px 10px 0px 10px" }}
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