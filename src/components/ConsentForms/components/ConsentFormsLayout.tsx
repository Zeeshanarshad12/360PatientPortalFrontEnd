import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { Grid, Box, Card, CardContent, Typography, Badge } from '@mui/material';
import { ConsentForm } from '@/types/ConsentForm';
import { getConsentForms } from '@/services/consentFormService';
import ConsentFormList from './ConsentFormList';
import ConsentFormViewer from './ConsentFormViewer';
import { useDispatch, useSelector } from '@/store/index';
import { GetConsentFormData } from '@/slices/patientprofileslice';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';

const HEADER_HEIGHT = 10;
const SPACING = 0;

function ConsentFormsLayout() {
  const [heartLoading, setHeartLoading] = useState(true);

  const [forms, setForms] = useState<ConsentForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<ConsentForm | null>(null);
  const dispatch = useDispatch();

  const { GetConsentFormDataList } = useSelector(
    (state) => state.patientprofileslice
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeartLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchConsentForms = async () => {
      try {
        const patientId = localStorage.getItem('patientID');
        if (!patientId) return;

        const response = await dispatch(GetConsentFormData(patientId)).unwrap();
        // setForms(response.result)

        const mappedForms: ConsentForm[] = response.result.map((form: any) => ({
          PatientID: form.patientID,
          FormID: String(form.formID), // Ensure it's string if required
          Title: form.title,
          Content: form.content,
          Status: form.status,
          SignedDate: form.signedDate,
          Signature: form.signature
        }));

        setForms(mappedForms);

        console.log('Fetched consent forms:', mappedForms);
      } catch (error) {
        console.error('Failed to fetch consent forms:', error);
      }
    };

    fetchConsentForms();
  }, [dispatch]);

  const pendingForms = useMemo(
    () => forms.filter((f) => f.Status === 'Pending'),
    [forms]
  );

  const handleFormSigned = (formId: string, Signature: string) => {
    const now = new Date().toISOString();

    setForms((prevForms) =>
      prevForms.map((f) =>
        f.FormID === formId
          ? { ...f, Status: 'Signed', Signature, SignedDate: now }
          : f
      )
    );

    setSelectedForm((prevForm) =>
      prevForm && prevForm.FormID === formId
        ? { ...prevForm, Status: 'Signed', Signature, SignedDate: now }
        : prevForm
    );
  };

  const handleSelectForm = (form: ConsentForm) => {
    setSelectedForm(form);
  };

  //  Automatically go to next pending form after 6 seconds of signing
  useEffect(() => {
    if (selectedForm?.Status !== 'Signed') return;

    const currentIndex = forms.findIndex(
      (f) => f.FormID === selectedForm.FormID
    );
    const nextPending = forms
      .slice(currentIndex + 1)
      .find((f) => f.Status === 'Pending');

    if (!nextPending) return; // Prevent endless "Thank You" trigger
    const timer = setTimeout(() => {
      setSelectedForm(nextPending);
    }, 6000); // wait 6 seconds

    return () => clearTimeout(timer);
  }, [forms, selectedForm]);

  return (
    <>
      {heartLoading ? (
        <HeartProgressLoader />
      ) : (
        <Grid
          container
          spacing={2}
          sx={{ padding: 1, paddingTop: `${SPACING + 1}px` }}
        >
          {/* Left Sidebar */}
          <Grid item xs={3}>
            <Box sx={{ height: `calc(100vh - ${HEADER_HEIGHT + SPACING}px)` }}>
              <Card
                variant="outlined"
                sx={{
                  height: '85%',
                  overflowY: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  pb: 2
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Consent Forms{' '}
                    <Badge
                      badgeContent={forms.length}
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                  <ConsentFormList
                    forms={forms}
                    selectedId={selectedForm?.FormID}
                    onSelect={setSelectedForm}
                  />
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Right Viewer Panel */}
          <Grid item xs={9}>
            <Box sx={{ height: `calc(100vh - ${HEADER_HEIGHT + SPACING}px)` }}>
              <Card
                variant="outlined"
                sx={{
                  height: '85%',
                  borderRadius: 2,
                  boxShadow: 3,
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <ConsentFormViewer
                  form={selectedForm}
                  onFormSigned={handleFormSigned}
                  pendingForms={pendingForms}
                  onSelectForm={handleSelectForm}
                />
              </Card>
            </Box>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default ConsentFormsLayout;