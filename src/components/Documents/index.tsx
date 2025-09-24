import { useState, useEffect } from 'react';
import React from 'react';
import { Box, Grid, Card, CardContent } from '@mui/material';
import DocumentsHeader from './components/DocumentsHeader';
import DocumentsSidebar from './components/DocumentsSidebar';
import DocumentsBody from './components/DocumentsBody';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';

const PatientDocuments = () => {
  const [dateRange, setDateRange] = React.useState<string>('3y');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [search, setSearch] = React.useState<string>('');
  const [showOnlyWithData, setShowOnlyWithData] = React.useState<boolean>(false);

  const [selectedTypeId, setSelectedTypeId] = React.useState<number | null>(null);

  const [heartLoading, setHeartLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeartLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {heartLoading ? (
        <HeartProgressLoader />
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            padding: 1,
            overflowY: 'auto',
            height: 'calc(100vh - 60px)'
          }}
          tabIndex={4}
        >
          <Grid container spacing={2}>
            {/* Header */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex' }}>
                <DocumentsHeader
                  dateRange={dateRange}
                  onChangeDateRange={setDateRange}
                  filterType={filterType}
                  onChangeFilterType={setFilterType}
                />
              </Box>
            </Grid>

            {/* Left Sidebar */}
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Box sx={{ height: 'calc(90vh - 60px)' }}>
                <Card
                  sx={{
                    height: '98%',
                    overflow: 'hidden',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent
                    sx={{
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <DocumentsSidebar
                      search={search}
                      onSearchChange={setSearch}
                      showOnlyWithData={showOnlyWithData}
                      onToggleShowOnlyWithData={setShowOnlyWithData}
                      selectedTypeId={selectedTypeId}
                      onSelectType={setSelectedTypeId} // updates state
                    />
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* Right Body */}
            <Grid item xs={12} sm={6} md={9} lg={9}>
              <Box sx={{ height: 'calc(90vh - 60px)' }}>
                <Card
                  sx={{
                    height: '98%',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  <DocumentsBody selectedTypeId={selectedTypeId} />
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};

export default PatientDocuments;