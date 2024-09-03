import { Box, Group, Stack, createStyles } from "@mantine/core";
import Link from "next/link";
import { cmlDiscordInviteUrl } from "~/consts/cmlDiscordInviteUrl";
import { COMING_SOON_PATHNAME } from "~/consts/pathnames";
import { blackBackgroundColor } from "~/styles/layoutColors";
import { difficultyColors } from "~/styles/difficultyColors";




const useStyles = createStyles(
    (theme) => ({
        outerFooter: {
            backgroundColor: blackBackgroundColor,
            /* top | left and right | bottom */
            padding: "1px 10px 10px",
        },
        footer: {
            padding: "0 12px",
            color: theme.white,
        },
        horizontalRule: {
            border: "2px solid",
            borderColor: difficultyColors.beginner.primaryHover.backgroundColor,
        },
        discordLink: {
            fontWeight: "bold",
            textAlign: "center",
        },
    })
);




export const Footer = () => {
    const { classes } = useStyles();

    return (
        <Box className={classes.outerFooter}>
            <hr className={classes.horizontalRule} />
            <footer className={classes.footer}>
                <Group
                    align="center"
                    grow
                    position="apart"
                >
                    <Stack
                        align="start"
                        spacing="1px"
                    >
                        <Link href={COMING_SOON_PATHNAME}>Settings</Link>
                    </Stack>
                    <Link
                        href={cmlDiscordInviteUrl}
                        className={classes.discordLink}
                        target="_blank"
                    >
                        Join Our Discord Server!
                    </Link>
                    <Stack
                        align="end"
                        spacing="1px"
                    >
                        <Link href={COMING_SOON_PATHNAME}>Cookie Policy</Link>
                        <Link href={COMING_SOON_PATHNAME}>Privacy Policy</Link>
                    </Stack>
                </Group>
            </footer>
        </Box>
    );
};