import Head from "next/head";
import { CustomHead } from "./customHead";
import { BackgroundImage, Grid, createStyles } from "@mantine/core";
import { Header } from "./header";
import { Navbar } from "./navbar";
import { Footer } from "./footer";


const useStyles = createStyles((_) => ({
    backgroundImage: {
        minWidth: "750px",
        minHeight: "100vh",
        padding: "20px",
    },
    children: {
        backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
        minHeight: "100%",
        padding: "5px 45px",
    },
}));


export type LayoutProps = {
    children: React.ReactNode;
    pageTitle: string;
    pageDescription: string;
    pathname: string;
    siteName?: string;
    robotsText?: string;
    socialMediaImageUrl?: string;
    socialMediaImageAlt?: string;
};


export function Layout({
    children,
    pageTitle,
    pageDescription,
    pathname,
    siteName = "Celeste Mods List",
    robotsText = "index,follow,nositelinkssearchbox",
    socialMediaImageUrl = "https://celestemods.com/img/cml_icon.png",
    socialMediaImageAlt = "Celeste Mods List Logo",
}: LayoutProps) {
  const { classes } = useStyles();


  return (
    <>
        <Head>
            <CustomHead
                pageTitle={pageTitle}
                pageDescription={pageDescription}
                pathname={pathname}
                siteName={siteName}
                robotsText={robotsText}
                socialMediaImageUrl={socialMediaImageUrl}
                socialMediaImageAlt={socialMediaImageAlt}
            />
        </Head>
        <BackgroundImage
            src="/images/cml_background1.png"
            className={classes.backgroundImage}
        >
            <Grid gutter="0">
                <Grid.Col span={2}></Grid.Col>
                <Grid.Col span={8}>
                    <Header />
                </Grid.Col>
                <Grid.Col span={2}></Grid.Col>
                <Grid.Col span={2}>
                    <Navbar
                        pathname={pathname}
                        pages={[
                            { label: "Home", pathname: "/" },
                            { label: "Mods", pathname: "/mods" },
                        ]}
                    />
                </Grid.Col>
                <Grid.Col span={8}>
                    <div className={classes.children}>{children}</div>
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
}
