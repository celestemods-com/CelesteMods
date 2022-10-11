import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ModsPage } from "./pages/ModsPage/ModsPage";
import { AppLayout } from "./otherComponents/AppLayout";
import { ModDropdown } from "./pages/ModsPage/ModDropdown/ModDropdown";


export const routes = [
    {
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
                pathname: "Home",
            },
            {
                path: "/mods",
                element: <ModsPage />,
                pathname: "Mods",
                children: [
                    {
                        path: "/mods/:modID",
                        element: <ModDropdown />,
                    }
                ],
            },
        ],
    },
];


export const router = createBrowserRouter(routes);