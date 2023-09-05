import { BackgroundImage, Box, Flex, Grid } from "@mantine/core";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { CustomHead } from "~/components/layout/customHead";
import Mods from "./mods";

type SiteNavLinkProps = {
  text: string;
  url: string;
};

const SiteNavLink = ({ text, url }: SiteNavLinkProps) => {
  return (
    <Link href={url}>
      <Flex
        sx={(_) => ({
          width: "125px",
          height: "35px",
        })}
      >
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          width="35px"
          height="35px"
          fill="#4263EB"
        >
          <polygon points="0,0 100,0 100,100 0,100 100,50" />
        </svg>
        <Flex
          sx={(theme) => ({
            backgroundColor: "#4263EB",
            color: theme.white,
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          })}
        >
          {text}
        </Flex>
      </Flex>
    </Link>
  );
};

const Navbar = () => {
  return (
    <nav>
      <Flex
        direction="column"
        align="end"
        gap="xs"
        sx={(_) => ({
          margin: "0",
        })}
      >
        <SiteNavLink text="Home" url="/home" />
        <SiteNavLink text="Mods" url="/home" />
        <SiteNavLink text="Reviews" url="/home" />
        <SiteNavLink text="Techs" url="/home" />
        <SiteNavLink text="Users" url="/home" />
        <SiteNavLink text="FAQ" url="/home" />
      </Flex>
    </nav>
  );
};

const Header = () => {
  return (
    <header>
      <Flex
        sx={(_) => ({
          color: "white",
          backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
        })}
      >
        <Image
          priority
          src="/images/logo/cml_logo.png"
          height={100}
          width={110}
          alt="logo"
        />
        <h1>Celeste Mods List</h1>
      </Flex>
    </header>
  );
};

const Footer = () => {
  return (
    <Box
      sx={(_) => ({
        backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
        padding: "10px"
      })}
    >
      <hr style={{
        border: "2px solid #4263EB"
      }}/>
      <footer>
        <Flex justify="space-between" align="center">
          <Flex direction="column">
            <Link href="">My account</Link>
            <Link href="">Settings</Link>
          </Flex>
          <Link href="" style={{
            fontWeight: "bold"
          }}>Join our Discord!</Link>
          <Flex direction="column">
            <Link href="">Cookie policy</Link>
            <Link href="">Privacy policy</Link>
          </Flex>
        </Flex>
      </footer>
    </Box>
  );
};

const Home = () => {
  return (
    <>
      <Head>
        <CustomHead
          pageTitle={"home"}
          pageDescription={"home page"}
          pathname={"home"}
          siteName={"celeste mods list"}
          robotsText={"robotsText"}
          socialMediaImageUrl={""}
          socialMediaImageAlt={"alt text"}
        />
      </Head>
      <BackgroundImage
        src="/images/cml_background1.png"
        sx={(_) => ({
        })}
      >
        <Grid
          gutter="0"
          sx={(_) => ({
            minWidth: "750px",
            paddingTop: "20px",
            margin: "auto",
          })}
        >
          <Grid.Col span={2}></Grid.Col>
          <Grid.Col span={8}>
            <Header />
          </Grid.Col>
          <Grid.Col span={2}></Grid.Col>
          <Grid.Col span={2}>
            <Navbar />
          </Grid.Col>
          <Grid.Col span={8}>
            <Box
              sx={(_) => ({
                backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
                minHeight: "100%",
                padding: "10px",
              })}
            >
              <Mods/>
            </Box>
          </Grid.Col>
          <Grid.Col span={2}></Grid.Col>
          <Grid.Col span={2}></Grid.Col>
          <Grid.Col span={8}>
            <Footer />
          </Grid.Col>
          <Grid.Col span={2}></Grid.Col>
        </Grid>
      </BackgroundImage>
    </>
  );
};

export default Home;
