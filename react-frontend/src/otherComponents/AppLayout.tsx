import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@mantine/core";
import { AppHeader } from "./header";
import { AppFooter } from "./footer";
import { AppNavbar } from "./navbar";


export const AppLayout = () => {
    const location = useLocation();
    const pathnameArray = location.pathname.split("/");
    const title = pathnameArray[pathnameArray.length - 1] || "home";
  
    return (
      <AppShell header={AppHeader(title)} footer={AppFooter()}>
        <Outlet />
      </AppShell>
    );
  }