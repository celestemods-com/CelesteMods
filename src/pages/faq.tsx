import type { NextPage } from "next";
import Link from "next/link";
import { Flex, ScrollArea, createStyles } from "@mantine/core";
import { Layout } from "~/components/layout/layout";
import { OLYMPUS_INSTALLATION_URL } from "~/consts/olympusInstallationUrl";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";




const useStyles = createStyles(
    (theme) => {
        return ({
            flexContainer: {
                "h2": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
                "h3": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
                "h4": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
                "p": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
            },
            scrollArea: {
                height: `${pageContentHeightPixels}px`,
            },
        });
    }
);




const FAQ: NextPage = () => {
    const { classes } = useStyles();


    return (
        <Layout
            pageTitle="FAQ"
            pageDescription="FAQ"
            pathname="/faq"
        >
            <ScrollArea
                offsetScrollbars
                className={classes.scrollArea}
            >
                <Flex
                    direction={"column"}
                    wrap={"wrap"}
                    className={classes.flexContainer}
                >
                    <h2>Installing Mods</h2>
                    <h3>Everest</h3>
                    <p>
                        Everest is the modding API for Celeste. It is required to install most mods, and is installed automatically when setting up Olympus. If you need to install Everest manually, you can find it on their <Link href={"https://github.com/EverestAPI/Everest/releases"}>GitHub</Link>.
                    </p>
                    <h3 id="mod_managers">Mod Managers</h3>
                    <h4>Olympus</h4>
                    <p>
                        Olympus is the recommended mod manager for Celeste. Everest is installed automatically during setup. You can find installation instructions for Windows, Mac, and Linux on the <Link href={OLYMPUS_INSTALLATION_URL}>Everest website</Link>.
                    </p>
                    <h4>CeleMod</h4>
                    <p>
                        CeleMod is a new alternative mod manager for Celeste. You can find installation instructions on <Link href={"https://gamebanana.com/tools/16200"}>GameBanana</Link>.
                    </p>
                    <h4>Mons</h4>
                    <p>
                        Mons is a commandline Everest installer and mod manager for Celeste. You can find installation instructions on <Link href={"https://github.com/coloursofnoise/mons"}>their GitHub</Link>.
                    </p>
                    <h2>Other FAQ</h2>
                    <p>Coming soon!</p>
                </Flex>
            </ScrollArea>
        </Layout>
    );
};

export default FAQ;