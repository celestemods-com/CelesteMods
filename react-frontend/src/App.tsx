import { AppShell } from "@mantine/core";
import { AppHeader } from "./otherComponents/header";
import { AppFooter } from "./otherComponents/footer";
import { AppNavbar } from "./otherComponents/navbar";
import { HomePage } from "./pages/HomePage";
import { ModsPage } from "./pages/ModsPage/ModsPage";
import { Outlet, useLocation, createBrowserRouter, RouterProvider } from "react-router-dom";


const AppLayout = () => {
  const location = useLocation();
  const pathnameArray = location.pathname.split("/");
  const title = pathnameArray[pathnameArray.length - 1] || "home";

  return (
    <AppShell header={AppHeader(title)} footer={AppFooter()}>
      <Outlet />
    </AppShell>
  );
}


const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/mods",
        element: <ModsPage />,
      },
    ],
  },
]);


export default function App() {
  return <RouterProvider router={router} />;
}