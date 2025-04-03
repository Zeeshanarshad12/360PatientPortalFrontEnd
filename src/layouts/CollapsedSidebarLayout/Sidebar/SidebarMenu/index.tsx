"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Fragment } from "react";
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

const MenuWrapper = styled(Box)(
  () => `
  // Styles for the Menu Wrapper
`
);

const SubMenuWrapper = styled(Box)(
  () => `
  // Styles for the SubMenu Wrapper
`
);

function SidebarMenu() {
  const [mounted, setMounted] = useState(false); // Track whether the component has mounted
  const pathname = usePathname();

  // Set mounted to true once the component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // If component is not mounted, return null to avoid accessing `useRouter` prematurely
  if (!mounted) {
    return null;
  }

  const key = uuidv4();

  const menu = [
    // {
    //   name: "Dashboard",
    //   link: "/patientportal/dashboard",
    //   key: key,
    //   active: pathname === "/patientportal/dashboard",
    //   badge: undefined,
    //   icon:
    //     pathname === "/patientportal/dashboard"
    //       ? "/statics/dashfill.svg"
    //       : "/statics/dashout.svg",
    //   right: true,
    // },
    {
      name: "Profile",
      link: "/patientportal/profile",
      key: key,
      active: pathname.includes("profile"),
      badge: undefined,
      icon: pathname.includes("profile")
        ? "/statics/pafill.svg"
        : "/statics/paout.svg",
      right: true,
    },
    {
      name: "Health Sharing",
      link: "/patientportal/healthsharing",
      key: key,
      active: pathname === "/patientportal/healthsharing",
      badge: undefined,
      icon:
        pathname === "/patientportal/healthsharing"
          ? "/statics/hsf.svg"
          : "/statics/hso.svg",
      right: true,
    },
    {
      name: "Authorized Users",
      link: "/patientportal/authorizedUser",
      key: key,
      active: pathname === "/patientportal/authorizedUser",
      badge: undefined,
      icon:
        pathname === "/patientportal/authorizedUser"
          ? "/statics/aufill.svg"
          : "/statics/auout.svg",
      right: true,
    },
    {
      name: "Find A Doctor",
      link: "/patientportal/findAdoc",
      key: key,
      active: pathname.includes("findAdoc"),
      badge: undefined,
      icon: pathname.includes("findAdoc")
        ? "/statics/docfill.svg"
        : "/statics/docout.svg",
      right: true,
    },
    {
      name: "Patient Visits",
      link: "/patientportal/patientvisits",
      key: key,
      active: pathname.includes("patientvisits"),
      badge: undefined,
      icon: pathname.includes("patientvisits")
        ? "/statics/pvfill.svg"
        : "/statics/pvout.svg",
      right: true,
    },
    {
      name: "Documents",
      link: "/patientportal/documents",
      key: key,
      active: pathname === "/patientportal/documents",
      badge: undefined,
      icon:
        pathname === "/patientportal/documents"
          ? "/statics/docufill.svg"
          : "/statics/docuout.svg",
      right: true,
    },
    {
      name: "Education and Resources",
      link: "/patientportal/educationAndresources",
      key: key,
      active: pathname === "/patientportal/educationAndresources",
      badge: undefined,
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
        ?.filter((menuitem) => menuitem.right)
        .map((item) => {
          const { name, link, active, icon } = item;
          return (
            <Fragment key={uuidv4()}>
              <MenuWrapper>
                <Box>
                  <SubMenuWrapper>
                    <List
                      sx={{ padding: "0px !important" }}
                      component="div"
                      id="main"
                    >
                      <ListItem component="div" key={name} id={name}>
                        <NextLink href={link}>
                          <Tooltip title={name} placement="right" arrow>
                            <IconButton
                              className={active ? "active-sidebar-item" : ""}
                            >
                              <div id="img" style={{ display: "flex" }}>
                                <Image
                                  src={icon}
                                  alt={name}
                                  width={25}
                                  height={25}
                                />
                              </div>
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
