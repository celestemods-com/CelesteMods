import { Container, AppShell, Header, Navbar, Footer, Aside, MantineProvider, Text } from "@mantine/core";
import { useState } from "react";
import { theme } from "./mantine/theme";
import { ModsPage } from "./pages/ModsPage/ModsPage";




export default function App() {
  const [title, setTitle] = useState("Mods");


  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
      <AppShell header={getHeader(title)} footer={getFooter()}>
        <Container>
          <ModsPage />
        </Container>
      </AppShell>
    </MantineProvider>
  );
}




const getHeader = (title: string) => {
  return (
    <Header height={100}>
      <Text>
        {title}
      </Text>
    </Header>
  )
}


const getAside = (title: string) => {
  return (
    <Aside>
      <Text>
        Currently on {title} page.
      </Text>
    </Aside>
  )
}


const getFooter = () => {
  return (
    <Footer height={50}>
      <Text>
        This is a footer.
      </Text>
    </Footer>
  )
}