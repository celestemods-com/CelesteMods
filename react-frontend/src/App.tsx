import { RouterProvider } from "react-router-dom";
import { Loader } from "@mantine/core";
import { router } from "./routerConfig";


export default function App() {
  return <RouterProvider router={router} fallbackElement={<Loader />} />;
}