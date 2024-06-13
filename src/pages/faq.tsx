import type { NextPage } from "next";
import Link from "next/link";
import { Flex, ScrollArea, Title, createStyles } from "@mantine/core";
import { Layout } from "~/components/layout/layout";
import { OLYMPUS_INSTALLATION_URL } from "~/consts/olympusInstallationUrl";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";
import { pageTitle } from "~/styles/pageTitle";




const useStyles = createStyles(
    (theme) => {
        return ({
            scrollArea: {
                height: `${pageContentHeightPixels + 39}px`,
                color: theme.white,
                "h2": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
                "h3": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
                "h4": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
                "h5": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
                "p": {
                    margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
                },
            },
            innerFlex: {
                flex: 1,
            },
            link: {
                textDecoration: "underline",
            },
            pageTitle,
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
            <Title className={classes.pageTitle} order={1} >
                FAQ
            </Title>
            <ScrollArea
                offsetScrollbars
                className={classes.scrollArea}
            >
                <Flex
                    direction="row"
                    wrap="nowrap"
                    justify="space-between"
                >
                    <Flex
                        className={classes.innerFlex}
                        direction="column"
                        wrap="wrap"
                    >
                        <h2>Installing Mods</h2>
                        <h3>Everest</h3>
                        <p>
                            Everest is the modding API for Celeste. It is required to install most mods, and is installed automatically when setting up Olympus. If you need to install Everest manually, you can find it on their <Link className={classes.link} href={"https://github.com/EverestAPI/Everest/releases"}>GitHub</Link>.
                        </p>
                        <h2 id="mod_managers">Mod Managers</h2>
                        <h4>Olympus</h4>
                        <p>
                            Olympus is the recommended mod manager for Celeste. Everest is installed automatically during setup. You can find installation instructions for Windows, Mac, and Linux on the <Link className={classes.link} href={OLYMPUS_INSTALLATION_URL}>Everest website</Link>.
                        </p>
                        <h4>CeleMod</h4>
                        <p>
                            CeleMod is a new alternative mod manager for Celeste. You can find installation instructions on <Link className={classes.link} href={"https://gamebanana.com/tools/16200"}>GameBanana</Link>.
                        </p>
                        <h4>Mons</h4>
                        <p>
                            Mons is a commandline Everest installer and mod manager for Celeste. You can find installation instructions on <Link className={classes.link} href={"https://github.com/coloursofnoise/mons"}>their GitHub</Link>.
                        </p>
                    </Flex>
                    <Flex
                        className={classes.innerFlex}
                        direction="column"
                        wrap="wrap"
                    >
                        <h2>Report An Issue</h2>
                        <p>
                            Our full list of known issues can be found on our <Link className={classes.link} href="https://github.com/celestemods-com/CelesteMods/issues">GitHub</Link>. If you encounter a new bug, please <Link className={classes.link} href="https://github.com/celestemods-com/CelesteMods/blob/main/CONTRIBUTING.md?#filing-a-bug-report">open an issue</Link>.
                        </p>
                        <h3>Known Issues</h3>
                        <h5><Link className={classes.link} href="https://github.com/celestemods-com/CelesteMods/issues/724">Difficulty Header Separated From Info Header</Link></h5>
                        <p>
                            The difficulty tabs are separated from the Mods table in Safari and other Webkit-based browsers. We are aware of this issue and plan to fix it in the future, but it is not currently a high-priority.
                        </p>
                        <h2>Roadmap</h2>
                        <p>
                            The most up-to-date roadmap is our GitHub <Link className={classes.link} href="https://github.com/celestemods-com/CelesteMods/milestones?direction=asc&sort=title">milestones</Link>.
                        </p>
                        <h4>v0.2.0</h4>
                        <p>
                            This update will add the ability for users to login and submit new map quality and difficulty ratings.
                        </p>
                        <h4>v0.3.0</h4>
                        <p>
                            This update will add tags to the UI for mods and maps, and will allow users to mark various maps as completed.
                        </p>
                        <h4>v0.4.0</h4>
                        <p>
                            This update will add the ability for users to submit new mods and maps.
                        </p>
                    </Flex>
                </Flex>
            </ScrollArea>
        </Layout>
    );
};

export default FAQ;