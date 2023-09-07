import { Box, Flex, Stack, createStyles } from "@mantine/core";
import Link from "next/link";


const useStyles = createStyles((_) => ({
    footer: {
        backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
        padding: "10px",
    },
    horizontalRule: {
        border: "2px solid #5b8bb3",
    },
    discordLink: {
        fontWeight: "bold",
    },
}));


export function Footer() {
    const { classes } = useStyles();


    return (
        <Box className={classes.footer}>
            <hr className={classes.horizontalRule} />
            <footer>
                <Flex justify="space-between" align="center">
                    <Stack spacing="1px">
                        <Link href="">My account</Link>
                        <Link href="">Settings</Link>
                    </Stack>
                    <Link href="" className={classes.discordLink}>
                        Join our Discord!
                    </Link>
                    <Stack spacing="1px">
                        <Link href="">Cookie policy</Link>
                        <Link href="">Privacy policy</Link>
                    </Stack>
                </Flex>
            </footer>
        </Box>
    );
}
