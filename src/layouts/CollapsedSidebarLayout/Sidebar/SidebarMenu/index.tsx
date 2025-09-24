'use client';

import { useEffect, useState, Fragment } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import {
  List,
  IconButton,
  Box,
  ListItem,
  styled,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import Image from 'next/image';
import { useAriaHiddenFixOnDialog } from '@/hooks/useAriaHiddenFixOnDialog';
import { useConsentFormContext } from '@/contexts/ConsentFormContext';

const MenuWrapper = styled(Box)(``);
const SubMenuWrapper = styled(Box)(``);

interface SidebarMenuProps {
  onItemClick?: () => void;
}

function SidebarMenu({ onItemClick }: SidebarMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [vdtAccess, setVdtAccess] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { pendingCount } = useConsentFormContext();

  // Set mounted and get localStorage on first load
  useEffect(() => {
    setMounted(true);
    const access = localStorage.getItem('vdtAccess') === 'true';
    setVdtAccess(access);
  }, []);

  // Fix MUI aria-hidden bug
  useAriaHiddenFixOnDialog(showAccessDenied);

  const restrictedLinks = [
    '/patientportal/healthsharing',
    '/patientportal/authorizedUser'
  ];

  const handleProtectedClick = (e, link) => {
    const access = localStorage.getItem('vdtAccess') === 'true';
    setVdtAccess(access);
    if (!access && restrictedLinks.includes(link)) {
      e.preventDefault(); // Block navigation
      setShowAccessDenied(true); // Show popup
    } else {
      router.push(link);
      // Close mobile menu after navigation
      if (onItemClick) {
        onItemClick();
      }
    }
  };

  const [localPendingCount, setLocalPendingCount] = useState<number>(0);

  useEffect(() => {
    // Initial read from localStorage on first render
    const storedCount = Number(
      localStorage.getItem('pendingConsentFormCount') || '0'
    );
    setLocalPendingCount(storedCount);

    // Recheck after 500ms (half second) for updated value
    const timer = setTimeout(() => {
      const updatedCount = Number(
        localStorage.getItem('pendingConsentFormCount') || '0'
      );
      setLocalPendingCount(updatedCount);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const menu = [
    {
      name: 'Dashboard',
      link: '/patientportal/dashboard',
      icon: pathname.includes('dashboard')
        ? '/statics/dashfill.svg'
        : '/statics/dashout.svg'
    },
    {
      name: 'Patient Info',
      link: '/patientportal/profile',
      icon: pathname.includes('profile')
        ? '/statics/pafill.svg'
        : '/statics/paout.svg'
    },
    {
      name: 'My Health Record',
      link: '/patientportal/healthsharing',
      icon:
        pathname === '/patientportal/healthsharing'
          ? '/statics/hsf.svg'
          : '/statics/hso.svg'
    },
    {
      name: 'Authorized User',
      link: '/patientportal/authorizedUser',
      icon:
        pathname === '/patientportal/authorizedUser'
          ? '/statics/aufill.svg'
          : '/statics/auout.svg'
    },
    {
      name: 'Documents',
      link: '/patientportal/documents',
      icon:
        pathname === '/patientportal/documents'
          ? '/statics/docufill.svg'
          : '/statics/docuout.svg'
    }
    // {
    //   name: 'Consent Forms',
    //   link: '/patientportal/consentforms',
    //   icon:
    //     pathname === '/patientportal/consentforms'
    //       ? '/statics/ConsentFormfill.svg'
    //       : '/statics/ConsentFormout.svg'
    // },
    // {
    //   name: 'Find A Doctor',
    //   link: '/patientportal/findAdoc',
    //   icon: pathname.includes('findAdoc')
    //     ? '/statics/docfill.svg'
    //     : '/statics/docout.svg'
    // },
    // {
    //   name: 'Patient Visits',
    //   link: '/patientportal/patientvisits',
    //   icon: pathname.includes('patientvisits')
    //     ? '/statics/pvfill.svg'
    //     : '/statics/pvout.svg'
    // },
    // {
    //   name: 'Patient Documents',
    //   link: '/patientportal/documents',
    //   icon:
    //     pathname === '/patientportal/documents'
    //       ? '/statics/docufill.svg'
    //       : '/statics/docuout.svg'
    // },
    // {
    //   name: 'Health Education',
    //   link: '/patientportal/educationAndresources',
    //   icon:
    //     pathname === '/patientportal/educationAndresources'
    //       ? '/statics/edufill.svg'
    //       : '/statics/eduout.svg'
    // }
  ];

  return (
    <>
      <Box sx={{ 
        my: 4.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      </Box>
      {menu.map((item) => (
        <Fragment key={uuidv4()}>
          <MenuWrapper>
            <Box>
              <SubMenuWrapper>
                <List
                  sx={{ padding: '0px !important' }}
                  component="div"
                  id={uuidv4()}
                >
                  <ListItem 
                    component="div" 
                    key={item.name} 
                    id={item.name}
                    sx={{ px: 2, py: 0.5 }}
                  >
                    <Box
                      onClick={(e) => handleProtectedClick(e, item.link)}
                      className={
                        pathname === item.link ? 'active-sidebar-item' : ''
                      }
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: '12px',
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        minHeight: '48px', // Touch-friendly minimum height
                        transition: 'all 0.2s ease-in-out',
                        color: 'rgba(0, 0, 0, 0.7)',
                        '&:hover': {
                          backgroundColor: '#E3F2FD',
                          color: '#0D47A1',
                          transform: 'translateX(4px)',
                          '& .MuiTypography-root': {
                            color: '#0D47A1'
                          },
                          '& img': {
                            filter: 'brightness(0) saturate(100%) invert(34%) sepia(85%) saturate(2104%) hue-rotate(188deg) brightness(91%) contrast(92%)'
                          }
                        },
                        '&:active': {
                          transform: 'translateX(2px)',
                          backgroundColor: '#BBDEFB',
                        },
                        ...(pathname === item.link && {
                          backgroundColor: '#E3F2FD',
                          color: '#0D47A1',
                          '& .MuiTypography-root': {
                            color: '#0D47A1',
                            fontWeight: 600
                          },
                          '& img': {
                            filter: 'brightness(0) saturate(100%) invert(34%) sepia(85%) saturate(2104%) hue-rotate(188deg) brightness(91%) contrast(92%)'
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '4px',
                            height: '24px',
                            backgroundColor: '#1976d2',
                            borderRadius: '0 2px 2px 0'
                          }
                        })
                      }}
                    >
                      {item.name === 'Consent Forms' ? (
                        <>
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={20}
                            height={20}
                          />
                          <Typography
                            sx={{
                              ml: '15px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                            variant="subtitle2"
                            component="h5"
                          >
                            {item.name}
                            {(pendingCount || localPendingCount) > 0 && (
                              <Box
                                component="span"
                                sx={{
                                  backgroundColor: '#1976d2',
                                  color: '#fff',
                                  fontSize: '0.60rem',
                                  borderRadius: '50%',
                                  padding: '2px 6px',
                                  minWidth: 15,
                                  textAlign: 'center',
                                  ml: 1
                                }}
                              >
                                {pendingCount || localPendingCount}
                              </Box>
                            )}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={20}
                            height={20}
                          />
                          <Typography
                            sx={{ 
                              ml: '15px',
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              letterSpacing: '0.5px'
                            }}
                            variant="subtitle2"
                            component="h5"
                          >
                            {item.name}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </ListItem>
                </List>
              </SubMenuWrapper>
            </Box>
          </MenuWrapper>
        </Fragment>
      ))}

      {/* Access Denied Popup */}
      <Dialog
        open={showAccessDenied}
        onClose={() => setShowAccessDenied(false)}
      >
        <DialogTitle
          sx={{
            color: '#b00020',
            fontWeight: 'bold'
          }}
        >
          Access Denied
        </DialogTitle>
        <DialogContent>
          You are not authorized to access PHI. Please contact support.
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowAccessDenied(false)}
            sx={{
              borderRadius: '5px',
              '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SidebarMenu;