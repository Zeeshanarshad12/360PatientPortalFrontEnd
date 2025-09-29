import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import FolderDocumentIcon from '@mui/icons-material/FolderSharedOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch } from 'react-redux';
import { getAllDocumentTypes } from '@/slices/patientprofileslice';

interface DocumentsSidebarProps {
  dateRange: string;
  search: string;
  onSearchChange: (v: string) => void;
  showOnlyWithData: boolean;
  onToggleShowOnlyWithData: (v: boolean) => void;
  selectedTypeId: number | null;
  onSelectType: (id: number) => void;
}

const DocumentsSidebar: React.FC<DocumentsSidebarProps & { dateRange: string }> = ({
  dateRange,
  search,
  onSearchChange,
  showOnlyWithData,
  onToggleShowOnlyWithData,
  selectedTypeId,
  onSelectType
}) => {
  const dispatch = useDispatch();
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { fromDate, toDate } = getDateRange(dateRange);

        const Obj = {
          patientId: localStorage.getItem('patientID'),
          fromDate: fromDate,
          toDate: toDate
        };
        const response = await dispatch(getAllDocumentTypes(Obj)).unwrap();
        setDocumentTypes(response.result || []);
      } catch (error) {
        console.error('Error fetching document types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, dateRange]);

  const { filtered, allCount } = useMemo(() => {
    const term = search.trim().toLowerCase();

    const map = (documentTypes || [])
      .map((parent: any) => {
        const children = (parent.documentSubTypes || []).filter((c: any) =>
          c.name.toLowerCase().includes(term)
        );

        const childrenAfterCount = showOnlyWithData
          ? children.filter((c: any) => (c.docTypeCount ?? 0) > 0)
          : children;

        if (childrenAfterCount.length === 0) return null;

        const parentCount = childrenAfterCount.reduce(
          (sum: number, c: any) => sum + (c.docTypeCount ?? 0),
          0
        );

        return {
          ...parent,
          documentSubTypes: childrenAfterCount,
          docTypeCount: parentCount
        };
      })
      .filter(Boolean) as any[];

    const totalCount = (documentTypes || []).reduce((sum: number, p: any) => {
      const childSum = (p.documentSubTypes || []).reduce(
        (s: number, c: any) => s + (c.docTypeCount ?? 0),
        0
      );
      return sum + childSum;
    }, 0);

    return { filtered: map, allCount: totalCount };
  }, [documentTypes, search, showOnlyWithData]);

  const renderCount = (n?: number) => (
    <Badge
      color="default"
      sx={{
        '& .MuiBadge-badge': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          minWidth: 22,
          height: 22,
          fontSize: '0.75rem',
          borderRadius: '50%'
        }
      }}
      badgeContent={n ?? 0}
    />
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: 1
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          mt: 0.5,
          borderRadius: 1,
          height: 30
        }}
      >
        <FolderDocumentIcon fontSize="medium" color="primary" />
        <Typography variant="h4" component="h4" sx={{ fontWeight: 700 }}>
          All Documents
        </Typography>
        <Box
          sx={{ display: 'flex', alignItems: 'right', ml: 'auto', mr: 1.4 }}
        >
          {loading ? renderCount(0) : renderCount(allCount)}
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Document Type"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon
                  fontSize="small"
                  sx={{ color: 'text.secondary', mr: -1 }}
                />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Scrollable list */}
      <Box sx={{ mt: 1, overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          filtered.map((parent: any, idx: number) => (
            <Box key={parent.id} sx={{ mb: 2 }}>
              {/* Parent name */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.primary', fontWeight: 700 }}
                >
                  {parent.name}
                </Typography>
              </Box>

              {/* Divider */}
              {idx < filtered.length && <Divider sx={{ my: 1, mr: 1 }} />}

              {/* Child list */}
              <List dense disablePadding>
                {(parent.documentSubTypes || []).map((child: any) => (
                  <ListItem
                    key={child.id}
                    onClick={() => onSelectType(child.id)}
                    selected={selectedTypeId === child.id}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      px: 1,
                      py: 0.8,
                      '&.Mui-selected': { bgcolor: '#eef5ff' },
                      '&:hover': { bgcolor: '#f7f9fc' }
                    }}
                    secondaryAction={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'right',
                          ml: 'auto',
                          mr: 0.5
                        }}
                      >
                        {renderCount(child.docTypeCount ?? 0)}
                      </Box>
                    }
                  >
                    <ListItemText
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                      primary={child.name}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Switch
          checked={showOnlyWithData}
          onChange={(e) => onToggleShowOnlyWithData(e.target.checked)}
          size="medium"
          inputProps={{ 'aria-label': 'Show Data Only' }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          Show Only with Data
        </Typography>
      </Box>
    </Box>
  );
};

export default DocumentsSidebar;