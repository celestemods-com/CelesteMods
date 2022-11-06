import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./otherComponents/AppLayout";
import { HomePage } from "./pages/HomePage";
import { LengthsPage } from "./pages/LengthsPage/LengthsPage";
import { ModsPage } from "./pages/ModsPage/ModsPage";


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
            {
                path: "/lengths",
                element: <LengthsPage />,
                pathname: "Lengths",
                children: [
                    {
                        element: null,
                        path: "/lengths/:lengthID",
                    }
                ],
            },
        ],
    },
];


export const router = createBrowserRouter(routes);