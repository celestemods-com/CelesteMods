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
                pathname: "Home",
            },
            {
                path: "/mods",
                element: <ModsPage />,
                pathname: "Mods",
                children: [
                    {
                        element: null,
                        path: "/mods/:modID",
                    }
                ],
            },
        ],
    },
];


export const router = createBrowserRouter(routes);