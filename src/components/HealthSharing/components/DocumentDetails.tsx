import React, { useState } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Collapse,
  Paper,
  TableHead
} from '@mui/material';

import { useSelector } from 'react-redux';
import {
  formatAddresswithCCDA,
  formatDateCCDADate,
  isNull
} from '@/utils/functions';

const DocumentDetails = ({ XmlToJson }) => {
    
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };
  const getFullName = (nameData: any): string => {
    if (!nameData) return '';

    const formatGiven = (given: any): string => {
      if (Array.isArray(given)) {
        return given
          .map((g) => {
            if (typeof g === 'string') return g;
            if (typeof g === 'object' && g._ && !g.$?.qualifier) return g._;
            return ''; // Skip if has qualifier or invalid
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

    // Handle array of name objects (use first one)
    if (Array.isArray(nameData) && nameData.length > 0) {
      const first = nameData[0];
      const given = formatGiven(first?.given[0]);
      const family = first?.family || '';
      return `${given} ${family}`.trim();
    }

    // Handle single name object
    if (typeof nameData === 'object') {
      const suffix = nameData.suffix || '';

      if (!('family' in nameData)) {
        // family key exist nahi karti
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
        // family key exist karti hai
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
    XmlToJson?.ClinicalDocument?.documentationOf?.serviceEvent?.performer;

  // Normalize performer to always be an array
  const performerList = Array.isArray(performers)
    ? performers
    : performers
    ? [performers]
    : [];

  const renderRowDiv = (
  label: string,
  value: React.ReactNode,
  label2?: string,
  value2?: React.ReactNode
) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
    <div style={{ flex: '0 0 180px', fontWeight: 'bold', color: 'black' }}>{label}:</div>
    <div style={{ flex: '1 1 300px' }}>{value}</div>
    {label2 && (
      <>
        <div style={{ flex: '0 0 100px', fontWeight: 'bold', color: 'black' }}>{label2}:</div>
        <div style={{ flex: '1 1 400px' }}>{value2}</div>
      </>
    )}
  </div>
);

  return (
    <div
      style={{
        paddingLeft: 10,
        height: showDetails ? '60vh' : 'auto',
        overflowY: showDetails ? 'auto' : 'hidden',
        width: '98%',
        overflowX: 'hidden'
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={toggleDetails}
        sx={{ mb: 1, borderRadius: '4px' }}
      >
        {showDetails ? 'Hide Document Details' : 'View Document Details'}
      </Button>

      <Collapse in={showDetails} timeout="auto" unmountOnExit>
        <Paper
          variant="outlined"
          sx={{
            mt: 2,
            width: '100% !important',
            overflow: 'auto'
          }}
        >
          {!isNull(XmlToJson) && (
          

              <div>
                {renderRowDiv(
                  'Patient',
                  getFullName(
                    XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                      ?.patient?.name
                  ),
                  'Sex',
                  XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                    ?.patient?.administrativeGenderCode?.code === 'M'
                    ? 'Male'
                    : XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                        ?.patient?.administrativeGenderCode?.code === 'F'
                    ? 'Female'
                    : XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                        ?.patient?.administrativeGenderCode?.code === 'UNK'
                    ? 'UNK'
                    : XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                        ?.patient?.administrativeGenderCode?.code === 'UN'
                    ? 'UNK'
                    : ''
                )}
                {renderRowDiv(
                  'D.O.B',
                  formatDateCCDADate(
                    XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                      ?.patient?.birthTime?.value
                  ),
                  'Ethnicity',
                  XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                    ?.patient?.ethnicGroupCode?.displayName
                )}
                {renderRowDiv(
                  'Race',
                  Array.isArray(
                    XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                      ?.patient?.raceCode
                  )
                    ? XmlToJson.ClinicalDocument.recordTarget.patientRole
                        .patient.raceCode[0]?.displayName || ''
                    : XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                        ?.patient?.raceCode?.displayName || '',

                  'Patient IDs',
                  Array.isArray(
                    XmlToJson?.ClinicalDocument?.recordTarget?.patientRole?.id
                  )
                    ? XmlToJson.ClinicalDocument.recordTarget.patientRole.id
                        .map((item: any) => {
                          const ext = item?.$?.extension || item?.extension;
                          const root = item?.$?.root || item?.root;
                          return `${ext} ${root}`.trim();
                        })
                        .filter((id: string) => id !== '') // Removes completely empty results
                        .join('  ')
                    : `${
                        XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                          ?.id?.extension || ''
                      } ${
                        XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                          ?.id?.root || ''
                      }`.trim()
                )}
                {renderRowDiv(
                  'Contact info',
                  <>
                    Primary Home:
                    <br />
                    {formatAddresswithCCDA(
                      XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                        ?.addr
                    )}
                    <br />
                    {(() => {
                      const telecom =
                        XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                          ?.telecom;
                      if (Array.isArray(telecom)) {
                        const mcPhone = telecom.find((t) => t?.use === 'MC');
                        return mcPhone?.value || '';
                      } else {
                        return telecom?.value || '';
                      }
                    })()}
                  </>
                )}

                {renderRowDiv(
                  'Document Id',
                  <>
                    {XmlToJson?.ClinicalDocument?.id?.extension}{' '}
                    {XmlToJson?.ClinicalDocument?.id?.root}
                  </>
                )}

                {renderRowDiv(
                  'Document Created',
                  formatDateCCDADate(
                    XmlToJson?.ClinicalDocument?.effectiveTime?.value
                  )
                )}
                {renderRowDiv(
                  'Care provision',
                  <>
                    {
                      XmlToJson?.ClinicalDocument?.documentationOf?.serviceEvent
                        ?.code?.displayName
                    }{' '}
                    from{' '}
                    {formatDateCCDADate(
                      XmlToJson?.ClinicalDocument?.documentationOf?.serviceEvent
                        ?.effectiveTime?.low?.value
                    )}{' '}
                    to{' '}
                    {formatDateCCDADate(
                      XmlToJson?.ClinicalDocument?.documentationOf?.serviceEvent
                        ?.effectiveTime?.high?.value
                    )}
                  </>
                )}
                {renderRowDiv(
                  'Performer (PCP)',
                  (() => {
                    if (performerList.length === 0) return null;
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

                    return (
                      <>
                        {prefix && `${prefix} `}
                        {given} {family}
                        {organizationName && ` of ${organizationName}`}
                      </>
                    );
                  })()
                )}

                {performerList.length > 1 &&
                  renderRowDiv(
                    'Performer',
                    (() => {
                      return (
                        <>
                          {performerList.slice(1).map((performer, index) => {
                            const assignedPerson =
                              performer?.assignedEntity?.assignedPerson?.name;
                            const prefix =
                              typeof assignedPerson?.prefix === 'object'
                                ? assignedPerson?.prefix?._
                                : assignedPerson?.prefix || '';
                            const given = assignedPerson?.given || '';
                            const family = assignedPerson?.family || '';

                            if (!given && !family) return null;

                            return (
                              <div key={index}>
                                {prefix && `${prefix} `}
                                {given} {family}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()
                  )}

                {renderRowDiv(
                  'Author',
                  <>
                    {!isNull(
                      XmlToJson?.ClinicalDocument?.author?.assignedAuthor
                        ?.assignedAuthoringDevice?.softwareName
                    ) &&
                      XmlToJson?.ClinicalDocument?.author?.assignedAuthor
                        ?.assignedAuthoringDevice?.softwareName}{' '}
                    {isNull(
                      XmlToJson?.ClinicalDocument?.author?.assignedAuthor
                        ?.assignedAuthoringDevice?.softwareName
                    ) && (
                      <>
                        {
                          XmlToJson?.ClinicalDocument?.author?.assignedAuthor
                            ?.assignedPerson?.name?.given
                        }{' '}
                        {
                          XmlToJson?.ClinicalDocument?.author?.assignedAuthor
                            ?.assignedPerson?.name?.family
                        }
                      </>
                    )}
                  </>
                )}

                {renderRowDiv(
                  'Author Contact',
                  <>
                    {formatAddresswithCCDA(
                      XmlToJson?.ClinicalDocument?.author?.assignedAuthor?.addr
                    )}
                    <br />
                    {
                      XmlToJson?.ClinicalDocument?.author?.assignedAuthor
                        ?.telecom?.value
                    }
                  </>
                )}

                {renderRowDiv(
                  'Encounter Id',
                  <>
                    {
                      XmlToJson?.ClinicalDocument?.componentOf
                        ?.encompassingEncounter?.id?.extension
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.componentOf
                        ?.encompassingEncounter?.id?.root
                    }{' '}
                  </>,
                  'Encounter Type',
                  XmlToJson?.ClinicalDocument?.documentationOf?.serviceEvent
                    ?.code?.displayName
                )}
                {renderRowDiv(
                  'Encounter Date',
                  <>
                    from{' '}
                    {formatDateCCDADate(
                      XmlToJson?.ClinicalDocument?.documentationOf?.serviceEvent
                        ?.effectiveTime?.low?.value
                    )}{' '}
                    to{' '}
                    {formatDateCCDADate(
                      XmlToJson?.ClinicalDocument?.documentationOf?.serviceEvent
                        ?.effectiveTime?.high?.value
                    )}
                  </>
                )}

                {renderRowDiv(
                  'Encounter Location',
                  <>
                    id:{' '}
                    {
                      XmlToJson?.ClinicalDocument?.componentOf
                        ?.encompassingEncounter?.id?.root
                    }{' '}
                  </>
                )}

                {renderRowDiv(
                  'Responsible party',
                  <>
                    {
                      XmlToJson?.ClinicalDocument?.componentOf
                        ?.encompassingEncounter?.encounterParticipant
                        ?.assignedEntity?.assignedPerson?.name?.prefix
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.componentOf
                        ?.encompassingEncounter?.encounterParticipant
                        ?.assignedEntity?.assignedPerson.name?.given
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.componentOf
                        ?.encompassingEncounter?.encounterParticipant
                        ?.assignedEntity?.assignedPerson.name?.family
                    }
                  </>
                )}
                { XmlToJson?.ClinicalDocument?.participant?.length > 0 && XmlToJson?.ClinicalDocument?.participant?.map(
                  (person: any, index: number) => {
                    const name =
                      person?.associatedEntity?.associatedPerson?.name;
                    const address = person?.associatedEntity?.addr;
                    const telecom =
                      person?.associatedEntity?.telecom?.value?.replace(
                        'tel:',
                        ''
                      );

                    return renderRowDiv(
                      'Personal relationship',
                      `${name?.prefix || ''} ${name?.given || ''} ${
                        name?.family || ''
                      }`.trim(),
                      'Contact info',
                      <>
                        Primary Home:
                        <br />
                        {address?.streetAddressLine}
                        <br />
                        {address?.city}, {address?.state} {address?.postalCode},{' '}
                        {address?.country}
                        <br />
                        Tel: {telecom}
                      </>
                    );
                  }
                )}

                {renderRowDiv(
                  'Entered By',
                  <>
                    {
                      XmlToJson?.ClinicalDocument?.dataEnterer?.assignedEntity
                        ?.assignedPerson?.name?.given
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.dataEnterer?.assignedEntity
                        ?.assignedPerson?.name?.family
                    }
                  </>,
                  'Contact Info',
                  <>
                    {formatAddresswithCCDA(
                      XmlToJson?.ClinicalDocument?.dataEnterer?.assignedEntity
                        ?.addr
                    )}
                    <br />
                    {
                      XmlToJson?.ClinicalDocument?.dataEnterer?.assignedEntity
                        ?.telecom?.value
                    }
                  </>
                )}

                {renderRowDiv(
                  'Signed',
                  <>
                    {
                      XmlToJson?.ClinicalDocument?.authenticator?.assignedEntity
                        ?.assignedPerson?.name?.prefix
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.authenticator?.assignedEntity
                        ?.assignedPerson?.name?.given
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.authenticator?.assignedEntity
                        ?.assignedPerson?.name?.family
                    }
                  </>,
                  'Contact Info',
                  <>
                    {formatAddresswithCCDA(
                      XmlToJson?.ClinicalDocument?.authenticator?.assignedEntity
                        ?.addr
                    )}
                    <br />
                    {
                      XmlToJson?.ClinicalDocument?.authenticator?.assignedEntity
                        ?.telecom?.value
                    }
                  </>
                )}

                { XmlToJson?.ClinicalDocument?.informant?.length > 0 && XmlToJson?.ClinicalDocument?.informant?.map(
                  (informant, index) => {
                    let name = '';
                    let address = '';
                    let telecom = '';

                    if (informant.assignedEntity) {
                      const person =
                        informant.assignedEntity.assignedPerson?.name;
                      const addr = informant.assignedEntity.addr;
                      const phone = informant.assignedEntity.telecom?.value;

                      name = [person?.given, person?.family]
                        .filter(Boolean)
                        .join(' ');
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
                      const person =
                        informant.relatedEntity.relatedPerson?.name;
                      name = [person?.given, person?.family]
                        .filter(Boolean)
                        .join(' ');
                      // Note: No address or phone for relatedEntity in your data
                    }

                    return (
                      <React.Fragment key={index}>
                        {renderRowDiv('Informant', name)}
                        {(address || telecom) &&
                          renderRowDiv(
                            'Contact Info',
                            <>
                              {address}
                              {telecom && (
                                <>
                                  <br />
                                  {telecom}
                                </>
                              )}
                            </>
                          )}
                      </React.Fragment>
                    );
                  }
                )}

                {renderRowDiv(
                  'Information recipient',
                  <>
                     {
                      XmlToJson?.ClinicalDocument?.informationRecipient
                        ?.intendedRecipient?.informationRecipient?.name?.prefix
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.informationRecipient
                        ?.intendedRecipient?.informationRecipient?.name?.given
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.informationRecipient
                        ?.intendedRecipient?.informationRecipient?.name?.family
                    }
                  </>
                )}

                {renderRowDiv(
                  'Legal authenticator',
                  <>
                     {
                      XmlToJson?.ClinicalDocument?.legalAuthenticator
                        ?.assignedEntity?.assignedPerson?.name.prefix
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.legalAuthenticator
                        ?.assignedEntity?.assignedPerson?.name.given
                    }{' '}
                    {
                      XmlToJson?.ClinicalDocument?.legalAuthenticator
                        ?.assignedEntity?.assignedPerson?.name.family
                    }{' '}
                    {'Signed At '}
                    {formatDateCCDADate(
                      XmlToJson?.ClinicalDocument?.legalAuthenticator?.time
                        ?.value
                    )}
                  </>,
                  'Contact info',
                  <>
                    {formatAddresswithCCDA(
                      XmlToJson?.ClinicalDocument?.legalAuthenticator
                        ?.assignedEntity?.addr
                    )}
                    <br />
                    {
                      XmlToJson?.ClinicalDocument?.legalAuthenticator
                        ?.assignedEntity?.telecom?.value
                    }
                  </>
                )}

                {renderRowDiv(
                  'Document maintained by',
                  <>
                    {
                      XmlToJson?.ClinicalDocument?.custodian?.assignedCustodian
                        ?.representedCustodianOrganization?.name
                    }{' '}
                  </>,
                  'Contact info',
                  <>
                    {'Work Place:'} <br />
                    {formatAddresswithCCDA(
                      XmlToJson?.ClinicalDocument?.custodian?.assignedCustodian
                        ?.representedCustodianOrganization?.addr
                    )}
                    <br />
                    {
                      XmlToJson?.ClinicalDocument?.custodian?.assignedCustodian
                        ?.representedCustodianOrganization?.telecom?.value
                    }
                  </>
                )}
              </div>
           
          )}
        </Paper>
      </Collapse>
    </div>
  );
};

export default DocumentDetails;
