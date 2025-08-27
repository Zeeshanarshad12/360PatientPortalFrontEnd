import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  Divider,
  Snackbar,
  Alert,
  AlertColor,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useDispatch, useSelector } from '@/store/index';
import { InsertActivityLog, ShareDocument } from '@/slices/patientprofileslice';
import { useEffect } from 'react';
import { useAriaHiddenFixOnDialog } from '@/hooks/useAriaHiddenFixOnDialog';
import { parseString } from 'xml2js';
import MapXMLDirectly from './MapXMLDirectly';
import {
  formatAddresswithCCDA,
  formatDateCCDADate,
  isNull
} from '@/utils/functions';

function EncounterDetailsReport() {
  const { EncounterId, ShareDocumentData } = useSelector(
    (state) => state.patientprofileslice
  );
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('error');
  const [messageSnackbar, setMessageSnackbar] = useState('');
  const [isTouched, setIsTouched] = useState(false); // Track if user has clicked Send
  const [emailError, setEmailError] = useState(false);
  const [includeCCD, setIncludeCCD] = useState(true);
  const [parseJson, setParsedJson] = useState(null);
  const [jsonError, setJsonError] = useState(null);
  const [isSending, setIsSending] = useState(false);


  //Save ActivityLog Obj
  const Logobj = {
    PatientId: localStorage.getItem('patientID'),
    Email: localStorage.getItem('Email'),
    ActivityTypeId: '3'
  };

  const Emailobj = {
    PatientEmail: email,
    EncounterId: EncounterId,
    message: message,
    includeCCD: includeCCD
  };

  const handleClickOpen = () => {
    setOpen(true);
    setMessage('');
    setIsTouched(false);
    setEmail('');
  };
  const handleClose = () => setOpen(false);

  const handleSendEmail = async () => {
    setIsTouched(true);

    const isEmailValid = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
    const isMessageValid = message.trim() !== '';

    setEmailError(!isEmailValid);

    if (!isEmailValid || !isMessageValid) {
      return; // stop here if any field is invalid
    }

    setIsSending(true);

    try {
      const emailResponse = await dispatch(ShareDocument(Emailobj)).unwrap();
      if (emailResponse === true) {
        handleClose();
        setMessageSnackbar('Email Sent Successfully!');
        setSeverity('success');
        setOpenSnackbar(true);

        const LogEmailobj = {
          PatientId: localStorage.getItem('patientID'),
          Email: email + '|' + localStorage.getItem('Email'), // localStorage.getItem('Email'),
          ActivityTypeId: '4'
        };
        dispatch(InsertActivityLog(LogEmailobj));
      } else {
        setMessageSnackbar(
          'Secure Email can only be sent to authorized Email addresses!'
        );
        setSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err: any) {
      setMessageSnackbar(err?.data?.message || 'Something went wrong!');
      setSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsSending(false);
    }
  };

  const { PatientCCDADetail } = useSelector(
    (state) => state.patientprofileslice
  );
  const { PatientCCDADetailXMLF } = useSelector(
    (state) => state.patientprofileslice
  );

  const handleDownload = () => {
    // Function to generate DocumentDetails HTML
    const generateDocumentDetailsHTML = (parseJson) => {
      const getFullName = (nameData) => {
        if (!nameData) return '';

        const formatGiven = (given) => {
          if (Array.isArray(given)) {
            return given
              .map((g) => {
                if (typeof g === 'string') return g;
                if (typeof g === 'object' && g._ && !g.$?.qualifier) return g._;
                return '';
              })
              .filter(Boolean)
              .join(' ');
          }

          if (typeof given === 'string') {
            return given;
          }

          if (typeof given === 'object' && given._ && !given.$?.qualifier) {
            return given._;
          }

          return '';
        };

        if (Array.isArray(nameData) && nameData.length > 0) {
          const first = nameData[0];
          const given = formatGiven(first?.given[0]);
          const family = first?.family || '';
          return `${given} ${family}`.trim();
        }

        if (typeof nameData === 'object') {
          const suffix = nameData.suffix || '';

          if (!('family' in nameData)) {
            const givenArray = Array.isArray(nameData.given)
              ? nameData.given
                  .map((item) => {
                    if (typeof item === 'string') return item;
                    if (typeof item === 'object' && item._) return item._;
                    return '';
                  })
                  .filter(Boolean)
              : [nameData.given];

            const fullGiven = givenArray.join(' ');
            return `${fullGiven}${suffix ? ' ' + suffix : ''}`.trim();
          } else {
            const given = formatGiven(
              Array.isArray(nameData.given) && nameData.given.length > 0
                ? nameData.given[0]
                : nameData.given
            );
            const family = nameData.family || '';
            const fullName = `${given} ${family}${
              suffix ? ', ' + suffix : ''
            }`.trim();

            if (!given && !family && !suffix) {
              return ',';
            }

            return fullName;
          }
        }

        return '';
      };

      const performers =
        parseJson?.ClinicalDocument?.documentationOf?.serviceEvent?.performer;
      const performerList = Array.isArray(performers)
        ? performers
        : performers
        ? [performers]
        : [];

      const renderRowHTML = (label, value, label2 = null, value2 = null) => {
        return `
        <div style="display: flex; flex-wrap: wrap; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
          <div style="flex: 0 0 180px; font-weight: bold; color: black;">${label}:</div>
          <div style="flex: 1 1 300px;">${value || ''}</div>
          ${
            label2
              ? `
            <div style="flex: 0 0 100px; font-weight: bold; color: black;">${label2}:</div>
            <div style="flex: 1 1 400px;">${value2 || ''}</div>
          `
              : ''
          }
        </div>
      `;
      };

      // Generate all the rows
      let documentDetailsHTML = '';

      if (!isNull(parseJson)) {
        // Patient and Sex
        const patientName = getFullName(
          parseJson?.ClinicalDocument?.recordTarget?.patientRole?.patient?.name
        );
        const genderCode =
          parseJson?.ClinicalDocument?.recordTarget?.patientRole?.patient
            ?.administrativeGenderCode?.code;
        const sex =
          genderCode === 'M'
            ? 'Male'
            : genderCode === 'F'
            ? 'Female'
            : genderCode === 'UNK' || genderCode === 'UN'
            ? 'UNK'
            : '';

        documentDetailsHTML += renderRowHTML(
          'Patient',
          patientName,
          'Sex',
          sex
        );

        // D.O.B and Ethnicity
        const dob = formatDateCCDADate(
          parseJson?.ClinicalDocument?.recordTarget?.patientRole?.patient
            ?.birthTime?.value
        );
        const ethnicity =
          parseJson?.ClinicalDocument?.recordTarget?.patientRole?.patient
            ?.ethnicGroupCode?.displayName;

        documentDetailsHTML += renderRowHTML(
          'D.O.B',
          dob,
          'Ethnicity',
          ethnicity
        );

        // Race and Patient IDs
        const race = Array.isArray(
          parseJson?.ClinicalDocument?.recordTarget?.patientRole?.patient
            ?.raceCode
        )
          ? parseJson.ClinicalDocument.recordTarget.patientRole.patient
              .raceCode[0]?.displayName || ''
          : parseJson?.ClinicalDocument?.recordTarget?.patientRole?.patient
              ?.raceCode?.displayName || '';

        const patientIds = Array.isArray(
          parseJson?.ClinicalDocument?.recordTarget?.patientRole?.id
        )
          ? parseJson.ClinicalDocument.recordTarget.patientRole.id
              .map((item) => {
                const ext = item?.$?.extension || item?.extension;
                const root = item?.$?.root || item?.root;
                return `${ext} ${root}`.trim();
              })
              .filter((id) => id !== '')
              .join('  ')
          : `${
              parseJson?.ClinicalDocument?.recordTarget?.patientRole?.id
                ?.extension || ''
            } ${
              parseJson?.ClinicalDocument?.recordTarget?.patientRole?.id
                ?.root || ''
            }`.trim();

        documentDetailsHTML += renderRowHTML(
          'Race',
          race,
          'Patient IDs',
          patientIds
        );

        // Contact info
        const telecom =
          parseJson?.ClinicalDocument?.recordTarget?.patientRole?.telecom;
        let phoneNumber = '';
        if (Array.isArray(telecom)) {
          const mcPhone = telecom.find((t) => t?.use === 'MC');
          phoneNumber = mcPhone?.value || '';
        } else {
          phoneNumber = telecom?.value || '';
        }

        const contactInfo = `Primary Home:<br/>${formatAddresswithCCDA(
          parseJson?.ClinicalDocument?.recordTarget?.patientRole?.addr
        )}<br/>${phoneNumber}`;

        documentDetailsHTML += renderRowHTML('Contact info', contactInfo);

        // Document Id
        const documentId = `${
          parseJson?.ClinicalDocument?.id?.extension || ''
        } ${parseJson?.ClinicalDocument?.id?.root || ''}`;
        documentDetailsHTML += renderRowHTML('Document Id', documentId);

        // Document Created
        const documentCreated = formatDateCCDADate(
          parseJson?.ClinicalDocument?.effectiveTime?.value
        );
        documentDetailsHTML += renderRowHTML(
          'Document Created',
          documentCreated
        );

        // Care provision
        const careProvision = `${
          parseJson?.ClinicalDocument?.documentationOf?.serviceEvent?.code
            ?.displayName || ''
        } from ${formatDateCCDADate(
          parseJson?.ClinicalDocument?.documentationOf?.serviceEvent
            ?.effectiveTime?.low?.value
        )} to ${formatDateCCDADate(
          parseJson?.ClinicalDocument?.documentationOf?.serviceEvent
            ?.effectiveTime?.high?.value
        )}`;
        documentDetailsHTML += renderRowHTML('Care provision', careProvision);

        // Performer (PCP)
        if (performerList.length > 0) {
          const performer = performerList[0];
          const assignedPerson =
            performer?.assignedEntity?.assignedPerson?.name;
          const organizationName =
            performer?.assignedEntity?.representedOrganization?.name;

          const prefix =
            typeof assignedPerson?.prefix === 'object'
              ? assignedPerson?.prefix?._
              : assignedPerson?.prefix || '';
          const given = assignedPerson?.given || '';
          const family = assignedPerson?.family || '';

          const performerPCP = `${prefix && `${prefix} `}${given} ${family}${
            organizationName ? ` of ${organizationName}` : ''
          }`.trim();
          documentDetailsHTML += renderRowHTML('Performer (PCP)', performerPCP);
        }

        // Additional Performers
        if (performerList.length > 1) {
          const additionalPerformers = performerList
            .slice(1)
            .map((performer) => {
              const assignedPerson =
                performer?.assignedEntity?.assignedPerson?.name;
              const prefix =
                typeof assignedPerson?.prefix === 'object'
                  ? assignedPerson?.prefix?._
                  : assignedPerson?.prefix || '';
              const given = assignedPerson?.given || '';
              const family = assignedPerson?.family || '';

              if (!given && !family) return '';
              return `${prefix && `${prefix} `}${given} ${family}`.trim();
            })
            .filter(Boolean)
            .join('<br/>');

          if (additionalPerformers) {
            documentDetailsHTML += renderRowHTML(
              'Performer',
              additionalPerformers
            );
          }
        }

        // Author
        const authorDevice =
          parseJson?.ClinicalDocument?.author?.assignedAuthor
            ?.assignedAuthoringDevice?.softwareName;
        const authorPerson = `${
          parseJson?.ClinicalDocument?.author?.assignedAuthor?.assignedPerson
            ?.name?.given || ''
        } ${
          parseJson?.ClinicalDocument?.author?.assignedAuthor?.assignedPerson
            ?.name?.family || ''
        }`.trim();
        const author = !isNull(authorDevice) ? authorDevice : authorPerson;

        documentDetailsHTML += renderRowHTML('Author', author);

        // Author Contact
        const authorContact = `${formatAddresswithCCDA(
          parseJson?.ClinicalDocument?.author?.assignedAuthor?.addr
        )}<br/>${
          parseJson?.ClinicalDocument?.author?.assignedAuthor?.telecom?.value ||
          ''
        }`;
        documentDetailsHTML += renderRowHTML('Author Contact', authorContact);

        // Encounter Id and Encounter Type
        const encounterId = `${
          parseJson?.ClinicalDocument?.componentOf?.encompassingEncounter?.id
            ?.extension || ''
        } ${
          parseJson?.ClinicalDocument?.componentOf?.encompassingEncounter?.id
            ?.root || ''
        }`.trim();
        const encounterType =
          parseJson?.ClinicalDocument?.documentationOf?.serviceEvent?.code
            ?.displayName;

        documentDetailsHTML += renderRowHTML(
          'Encounter Id',
          encounterId,
          'Encounter Type',
          encounterType
        );

        // Encounter Date
        const encounterDate = `from ${formatDateCCDADate(
          parseJson?.ClinicalDocument?.documentationOf?.serviceEvent
            ?.effectiveTime?.low?.value
        )} to ${formatDateCCDADate(
          parseJson?.ClinicalDocument?.documentationOf?.serviceEvent
            ?.effectiveTime?.high?.value
        )}`;
        documentDetailsHTML += renderRowHTML('Encounter Date', encounterDate);

        // Encounter Location
        const encounterLocation = `id: ${
          parseJson?.ClinicalDocument?.componentOf?.encompassingEncounter?.id
            ?.root || ''
        }`;
        documentDetailsHTML += renderRowHTML(
          'Encounter Location',
          encounterLocation
        );

        // Responsible party
        const responsibleParty = `${
          parseJson?.ClinicalDocument?.componentOf?.encompassingEncounter
            ?.encounterParticipant?.assignedEntity?.assignedPerson?.name
            ?.prefix || ''
        } ${
          parseJson?.ClinicalDocument?.componentOf?.encompassingEncounter
            ?.encounterParticipant?.assignedEntity?.assignedPerson?.name
            ?.given || ''
        } ${
          parseJson?.ClinicalDocument?.componentOf?.encompassingEncounter
            ?.encounterParticipant?.assignedEntity?.assignedPerson?.name
            ?.family || ''
        }`.trim();
        documentDetailsHTML += renderRowHTML(
          'Responsible party',
          responsibleParty
        );

        // Personal relationships
        if (parseJson?.ClinicalDocument?.participant?.length > 0) {
          parseJson.ClinicalDocument.participant.forEach((person) => {
            const name = person?.associatedEntity?.associatedPerson?.name;
            const address = person?.associatedEntity?.addr;
            const telecom = person?.associatedEntity?.telecom?.value?.replace(
              'tel:',
              ''
            );

            const personName = `${name?.prefix || ''} ${name?.given || ''} ${
              name?.family || ''
            }`.trim();
            const contactInfo = `Primary Home:<br/>${address?.streetAddressLine}<br/>${address?.city}, ${address?.state} ${address?.postalCode}, ${address?.country}<br/>Tel: ${telecom}`;

            documentDetailsHTML += renderRowHTML(
              'Personal relationship',
              personName,
              'Contact info',
              contactInfo
            );
          });
        }

        // Entered By
        const enteredBy = `${
          parseJson?.ClinicalDocument?.dataEnterer?.assignedEntity
            ?.assignedPerson?.name?.given || ''
        } ${
          parseJson?.ClinicalDocument?.dataEnterer?.assignedEntity
            ?.assignedPerson?.name?.family || ''
        }`.trim();
        const enteredByContact = `${formatAddresswithCCDA(
          parseJson?.ClinicalDocument?.dataEnterer?.assignedEntity?.addr
        )}<br/>${
          parseJson?.ClinicalDocument?.dataEnterer?.assignedEntity?.telecom
            ?.value || ''
        }`;

        documentDetailsHTML += renderRowHTML(
          'Entered By',
          enteredBy,
          'Contact Info',
          enteredByContact
        );

        // Signed
        const signed = `${
          parseJson?.ClinicalDocument?.authenticator?.assignedEntity
            ?.assignedPerson?.name?.prefix || ''
        } ${
          parseJson?.ClinicalDocument?.authenticator?.assignedEntity
            ?.assignedPerson?.name?.given || ''
        } ${
          parseJson?.ClinicalDocument?.authenticator?.assignedEntity
            ?.assignedPerson?.name?.family || ''
        }`.trim();
        const signedContact = `${formatAddresswithCCDA(
          parseJson?.ClinicalDocument?.authenticator?.assignedEntity?.addr
        )}<br/>${
          parseJson?.ClinicalDocument?.authenticator?.assignedEntity?.telecom
            ?.value || ''
        }`;

        documentDetailsHTML += renderRowHTML(
          'Signed',
          signed,
          'Contact Info',
          signedContact
        );

        // Informants
        if (parseJson?.ClinicalDocument?.informant?.length > 0) {
          parseJson.ClinicalDocument.informant.forEach((informant) => {
            let name = '';
            let address = '';
            let telecom = '';

            if (informant.assignedEntity) {
              const person = informant.assignedEntity.assignedPerson?.name;
              const addr = informant.assignedEntity.addr;
              const phone = informant.assignedEntity.telecom?.value;

              name = [person?.given, person?.family].filter(Boolean).join(' ');
              address = [
                addr?.streetAddressLine,
                addr?.city,
                addr?.state,
                addr?.postalCode,
                addr?.country
              ]
                .filter(Boolean)
                .join(', ');
              telecom = phone;
            }

            if (informant.relatedEntity) {
              const person = informant.relatedEntity.relatedPerson?.name;
              name = [person?.given, person?.family].filter(Boolean).join(' ');
            }

            documentDetailsHTML += renderRowHTML('Informant', name);

            if (address || telecom) {
              const contactInfo = `${address}${
                telecom ? `<br/>${telecom}` : ''
              }`;
              documentDetailsHTML += renderRowHTML('Contact Info', contactInfo);
            }
          });
        }

        // Information recipient
        const infoRecipient = `${
          parseJson?.ClinicalDocument?.informationRecipient?.intendedRecipient
            ?.informationRecipient?.name?.prefix || ''
        } ${
          parseJson?.ClinicalDocument?.informationRecipient?.intendedRecipient
            ?.informationRecipient?.name?.given || ''
        } ${
          parseJson?.ClinicalDocument?.informationRecipient?.intendedRecipient
            ?.informationRecipient?.name?.family || ''
        }`.trim();
        documentDetailsHTML += renderRowHTML(
          'Information recipient',
          infoRecipient
        );

        // Legal authenticator
        const legalAuth = `${
          parseJson?.ClinicalDocument?.legalAuthenticator?.assignedEntity
            ?.assignedPerson?.name?.prefix || ''
        } ${
          parseJson?.ClinicalDocument?.legalAuthenticator?.assignedEntity
            ?.assignedPerson?.name?.given || ''
        } ${
          parseJson?.ClinicalDocument?.legalAuthenticator?.assignedEntity
            ?.assignedPerson?.name?.family || ''
        } Signed At ${formatDateCCDADate(
          parseJson?.ClinicalDocument?.legalAuthenticator?.time?.value
        )}`.trim();
        const legalAuthContact = `${formatAddresswithCCDA(
          parseJson?.ClinicalDocument?.legalAuthenticator?.assignedEntity?.addr
        )}<br/>${
          parseJson?.ClinicalDocument?.legalAuthenticator?.assignedEntity
            ?.telecom?.value || ''
        }`;

        documentDetailsHTML += renderRowHTML(
          'Legal authenticator',
          legalAuth,
          'Contact info',
          legalAuthContact
        );

        // Document maintained by
        const maintainedBy =
          parseJson?.ClinicalDocument?.custodian?.assignedCustodian
            ?.representedCustodianOrganization?.name || '';
        const maintainedByContact = `Work Place:<br/>${formatAddresswithCCDA(
          parseJson?.ClinicalDocument?.custodian?.assignedCustodian
            ?.representedCustodianOrganization?.addr
        )}<br/>${
          parseJson?.ClinicalDocument?.custodian?.assignedCustodian
            ?.representedCustodianOrganization?.telecom?.value || ''
        }`;

        documentDetailsHTML += renderRowHTML(
          'Document maintained by',
          maintainedBy,
          'Contact info',
          maintainedByContact
        );
      }

      return documentDetailsHTML;
    };

    // Extract and format section titles from the PatientCCDADetail
    const extractAndFormatSections = (htmlString) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const sections = doc.querySelectorAll('component > section');

      let formatted = '';

      sections.forEach((section, index) => {
        const title =
          section.querySelector('title')?.textContent?.trim() ||
          `Section ${index + 1}`;
        const content =
          section.querySelector('text')?.innerHTML?.trim() ||
          'No information available';

        formatted += `
        <div class="section">
          <h3 class="section-title">${title}</h3>
          <div>${content}</div>
        </div>
      `;
      });

      return formatted || htmlString;
    };

    const formattedSections = extractAndFormatSections(PatientCCDADetail);

    // Generate DocumentDetails HTML (assuming you have parseJson available)
    const documentDetailsHTML = generateDocumentDetailsHTML(parseJson);

    const styledHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Patient Clinical Document</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
    padding: 20px;
    font-size: 14px;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    text-align: center;
  }
  .header h1 {
    font-size: 18px;
    margin-bottom: 10px;
    font-weight: 500;
  }
  .header p {
    font-size: 14px;
    opacity: 0.9;
  }
  .content {
    padding: 30px;
  }
  .section {
    margin-bottom: 30px;
    border-left: 4px solid #667eea;
    padding-left: 20px;
  }
  .section-title {
    color: #667eea;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .document-details {
    margin-bottom: 30px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }
  .document-details-header {
    background-color: #f8f9fa;
    padding: 15px;
    border-bottom: 1px solid #e0e0e0;
  }
  .document-details-header h3 {
    color: #667eea;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
  .document-details-content {
    padding: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 14px;
  }
  th, td {
    padding: 10px;
    border: 1px solid #dee2e6;
    text-align: left;
  }
  th {
    background-color: #f1f3f5;
    color: #495057;
    font-size: 14px;
  }
  .timestamp {
    color: #6c757d;
    font-size: 14px;
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
  }
  @media print {
    body { background: white; padding: 0; }
    .container { box-shadow: none; max-width: none; }
    .header { background: #667eea !important; -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Clinical Document</h1>
      <h1>Continuity of Care Document (CCD)</h1>
    </div>
    <div class="content">
      <div class="document-details">
        <div class="document-details-header">
          <h3>Document Details</h3>
        </div>
        <div class="document-details-content">
          ${documentDetailsHTML}
        </div>
      </div>
      ${formattedSections}
    </div>
    <div class="timestamp">
      Generated on: ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([styledHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `patient_clinical_document_${
      new Date().toISOString().split('T')[0]
    }.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    dispatch(InsertActivityLog(Logobj));
  };

  const handleDownloadxml = () => {
    const blob = new Blob([PatientCCDADetailXMLF], {
      type: 'application/xml'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `patient_data.${'xml'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(InsertActivityLog(Logobj));
  };

  useAriaHiddenFixOnDialog(open);

  useEffect(() => {
    if (PatientCCDADetail) {
      parseString(
        PatientCCDADetail,
        { explicitArray: false, mergeAttrs: true },
        (err, result) => {
          if (err) {
            setParsedJson(null);
            setJsonError('Failed to parse XML content.');
          } else {
            setParsedJson(result);
            setJsonError(null);
          }
        }
      );
    }
  }, [PatientCCDADetail]);

  return (
    <Box
      sx={{
        padding: 1,
        flexGrow: 1
      }}
    >
      {isNull(parseJson) ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CircularProgress size={30} color="primary" />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 'calc(64vh - 100px)',
            backgroundColor: '#fff',
            overflowY: 'auto'
          }}
        >
          <MapXMLDirectly XmlToJson={parseJson} />
        </Box>
      )}

      <Grid container spacing={2} justifyContent="right" sx={{ marginTop: 2 }}>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '5px',
              '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={handleClickOpen}
          >
            Email
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '5px',
              '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={() => handleDownload()}
          >
            Download (Human Readable Format)
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '5px',
              '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={() => handleDownloadxml()}
          >
            Download (CCD Format)
          </Button>
        </Grid>
      </Grid>

      {/* Dialog box for Email Pop-up */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Send Health Data
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Divider sx={{ marginY: 1 }} />
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center">
              <AttachFileIcon color="action" />
              <Typography variant="body2" fontWeight="bold">
                CCD document will be automatically attached to this message
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                id="emailAddress"
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isTouched) {
                    const isValid = /\S+@\S+\.\S+/.test(e.target.value);
                    setEmailError(!isValid);
                  }
                }}
                margin="dense"
                variant="outlined"
                required
                error={isTouched && emailError}
                helperText={
                  isTouched && emailError ? 'Enter a valid email address' : ''
                }
                FormHelperTextProps={{
                  sx: {
                    fontWeight: 'normal'
                  }
                }}
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-error': {
                      borderColor: 'transparent'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'gray'
                  },
                  '& .MuiInputLabel-root.Mui-error': {
                    color: 'gray'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeCCD}
                    onChange={(e) => setIncludeCCD(e.target.checked)}
                    color="primary"
                  />
                }
                label="Secure"
                sx={{ whiteSpace: 'nowrap' }}
              />
            </Box>

            <TextField
              id="MessageId"
              fullWidth
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="dense"
              variant="outlined"
              multiline
              rows={3}
              required
              error={isTouched && !message} // Show error if message is empty and Send button is clicked
              helperText={
                isTouched && !message ? 'Message cannot be empty' : ''
              } // Custom helper text when Send is clicked
              FormHelperTextProps={{
                sx: {
                  fontWeight: 'normal' // Ensures the helper text is not bold
                }
              }}
              sx={{
                // Remove red outline when there's an error
                '& .MuiOutlinedInput-root': {
                  '&.Mui-error': {
                    borderColor: 'transparent' // Make the error border transparent
                  }
                },
                // Change placeholder color to be normal even when error is present
                '& .MuiInputBase-input::placeholder': {
                  color: 'gray' // Placeholder color when there is an error
                },
                // Optional: Style the label when there is an error
                '& .MuiInputLabel-root.Mui-error': {
                  color: 'gray' // You can change this to any color you want for the label
                }
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'flex-end',
            paddingRight: '22px',
            marginBottom: '10px'
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '5px',
              '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: '5px',
              '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={handleSendEmail}
            disabled={isSending}
          >
            {isSending ? 'Please wait...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Success Message of Sent Email */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={severity}
          variant="filled"
        >
          {messageSnackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EncounterDetailsReport;