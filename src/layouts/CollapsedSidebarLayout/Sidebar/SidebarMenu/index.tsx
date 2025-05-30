"use client";
import { useEffect, useState, Fragment } from "react";
import { usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import NextLink from "next/link";
import {
  List,
  IconButton,
  Box,
  ListItem,
  styled,
  Tooltip,
} from "@mui/material";
import Image from "next/image";

const MenuWrapper = styled(Box)(`
  // Add any MenuWrapper styles here if needed
`);

const SubMenuWrapper = styled(Box)(`
  // Add any SubMenuWrapper styles here if needed
`);

function SidebarMenu() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const menu = [
    {
      name: "Profile",
      link: "/patientportal/profile",
      key: uuidv4(),
      active: pathname.includes("profile"),
      icon: pathname.includes("profile")
        ? "/statics/pafill.svg"
        : "/statics/paout.svg",
      right: true,
    },
    {
      name: "Health Sharing",
      link: "/patientportal/healthsharing",
      key: uuidv4(),
      active: pathname === "/patientportal/healthsharing",
      icon:
        pathname === "/patientportal/healthsharing"
          ? "/statics/hsf.svg"
          : "/statics/hso.svg",
      right: true,
    },
    {
      name: "Authorized Users",
      link: "/patientportal/authorizedUser",
      key: uuidv4(),
      active: pathname === "/patientportal/authorizedUser",
      icon:
        pathname === "/patientportal/authorizedUser"
          ? "/statics/aufill.svg"
          : "/statics/auout.svg",
      right: true,
    },
    {
      name: "Find A Doctor",
      link: "/patientportal/findAdoc",
      key: uuidv4(),
      active: pathname.includes("findAdoc"),
      icon: pathname.includes("findAdoc")
        ? "/statics/docfill.svg"
        : "/statics/docout.svg",
      right: true,
    },
    {
      name: "Patient Visits",
      link: "/patientportal/patientvisits",
      key: uuidv4(),
      active: pathname.includes("patientvisits"),
      icon: pathname.includes("patientvisits")
        ? "/statics/pvfill.svg"
        : "/statics/pvout.svg",
      right: true,
    },
    {
      name: "Documents",
      link: "/patientportal/documents",
      key: uuidv4(),
      active: pathname === "/patientportal/documents",
      icon:
        pathname === "/patientportal/documents"
          ? "/statics/docufill.svg"
          : "/statics/docuout.svg",
      right: true,
    },
    {
      name: "Education and Resources",
      link: "/patientportal/educationAndresources",
      key: uuidv4(),
      active: pathname === "/patientportal/educationAndresources",
      icon:
        pathname === "/patientportal/educationAndresources"
          ? "/statics/edufill.svg"
          : "/statics/eduout.svg",
      right: true,
    },
  ];

  return (
    <>
      <Box sx={{ my: 10 }}></Box>
      {menu
        .filter((menuitem) => menuitem.right)
        .map((item) => {
          const { name, link, active, icon, key } = item;
          return (
            <Fragment key={key}>
              <MenuWrapper>
                <Box>
                  <SubMenuWrapper>
                    <List sx={{ padding: "0px !important" }} component="div" id="main">
                      <ListItem component="div" key={name} id={name}>
                        <NextLink href={link} passHref legacyBehavior>
                          <Tooltip title={name} placement="right" arrow>
                            <IconButton
                              component="a"
                              className={active ? "active-sidebar-item" : ""}
                              aria-current={active ? "page" : undefined}
                              sx={{
                                '&:focus': {
                                  outline: '2px solid #1976d2',
                                  outlineOffset: '2px'
                                },
                                '&:focus-visible': {
                                  outline: '2px solid #1976d2',
                                  outlineOffset: '2px'
                                }
                              }}
                            >
                              <div style={{ display: "flex" }}>
                                <Image
                                  src={icon}
                                  alt={name+key}
                                  width={25}
                                  height={25}
                                />
                              </div>
                              <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
                                {name}
                              </span>
                            </IconButton>
                          </Tooltip>
                        </NextLink>
                      </ListItem>
                    </List>
                  </SubMenuWrapper>
                </Box>
              </MenuWrapper>
            </Fragment>
          );
        })}
    </>
  );
}

export default SidebarMenu;
