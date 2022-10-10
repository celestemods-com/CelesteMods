import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ModsPage } from "./pages/ModsPage/ModsPage";
import { AppLayout } from "./otherComponents/AppLayout";


export const routes = [
    {
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
                key: "Home",
            },
            {
                path: "/mods",
                element: <ModsPage />,
                key: "Mods",
            },
        ],
    },
];


export const router = createBrowserRouter(routes);