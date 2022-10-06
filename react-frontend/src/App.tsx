import { Container, AppShell, MantineProvider } from "@mantine/core";
import { useState } from "react";
import { theme } from "./mantine/theme";
import { AppHeader } from "./otherComponents/header";
import { AppFooter } from "./otherComponents/footer";
import { AppNavbar } from "./otherComponents/navbar";
import { ModsPage } from "./pages/ModsPage/ModsPage";




export default function App() {
  const [title, setTitle] = useState("Mods");


  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
      <AppShell header={AppHeader(title)} footer={AppFooter()}>
        <Container>
          <ModsPage />
          <AppNavbar title={title} />
        </Container>
      </AppShell>
    </MantineProvider>
  );
}