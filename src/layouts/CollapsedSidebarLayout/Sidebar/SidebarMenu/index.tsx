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

const MenuWrapper = styled(Box)(``);
const SubMenuWrapper = styled(Box)(``);

function SidebarMenu() {
  const [mounted, setMounted] = useState(false);
  const [vdtAccess, setVdtAccess] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    }
  };

  if (!mounted) return null;

  const menu = [
    {
      name: 'Patient Info',
      link: '/patientportal/profile',
      icon: pathname.includes('profile')
        ? '/statics/pafill.svg'
        : '/statics/paout.svg'
    },
    {
      name: 'Health Records',
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
      name: 'Consent Forms',
      link: '/patientportal/consentforms',
      icon:
        pathname === '/patientportal/consentforms'
          ? '/statics/ConsentFormfill.svg'
          : '/statics/ConsentFormout.svg'
    },
    {
      name: 'Find A Doctor',
      link: '/patientportal/findAdoc',
      icon: pathname.includes('findAdoc')
        ? '/statics/docfill.svg'
        : '/statics/docout.svg'
    },
    {
      name: 'Patient Visits',
      link: '/patientportal/patientvisits',
      icon: pathname.includes('patientvisits')
        ? '/statics/pvfill.svg'
        : '/statics/pvout.svg'
    },
    {
      name: 'Patient Documents',
      link: '/patientportal/documents',
      icon:
        pathname === '/patientportal/documents'
          ? '/statics/docufill.svg'
          : '/statics/docuout.svg'
    },
    {
      name: 'Health Education',
      link: '/patientportal/educationAndresources',
      icon:
        pathname === '/patientportal/educationAndresources'
          ? '/statics/edufill.svg'
          : '/statics/eduout.svg'
    }
  ];

  return (
    <>
      <Box sx={{ my: 10 }} />
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
                  <ListItem component="div" key={item.name} id={item.name}>
                    <Box
                      onClick={(e) => handleProtectedClick(e, item.link)}
                      className={
                        pathname === item.link ? 'active-sidebar-item' : ''
                      }
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: '10px',
                        px: 1.5,
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#E3F2FD',
                          color: '#1976D2',
                          '& .MuiTypography-root': {
                            color: '#1976D2'
                          },
                          '& img': {
                            filter:
                              'brightness(0) saturate(100%) invert(34%) sepia(85%) saturate(2104%) hue-rotate(188deg) brightness(91%) contrast(92%)'
                          }
                        },
                        ...(pathname === item.link && {
                          backgroundColor: '#E3F2FD',
                          color: '#1976D2',
                          '& .MuiTypography-root': {
                            color: '#1976D2'
                          },
                          '& img': {
                            filter:
                              'brightness(0) saturate(100%) invert(34%) sepia(85%) saturate(2104%) hue-rotate(188deg) brightness(91%) contrast(92%)'
                          }
                        })
                      }}
                    >
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={25}
                        height={25}
                      />
                      <Typography
                        sx={{ ml: '15px' }}
                        variant="subtitle2"
                        component="h5"
                      >
                        {item.name}
                      </Typography>
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