import { Group, Stack, createStyles, Title, Button } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import cmlLogo from "~/../public/images/logo/cml_logo.png";
import { blackBackgroundColor } from "~/styles/layoutColors";




const useStyles = createStyles(
    (theme) => ({
        header: {
            color: theme.white,
            backgroundColor: blackBackgroundColor,
            padding: "10px 45px",
            alignItems: "center",
        },
        siteTitle: {
            fontSize: "45px",
            flexGrow: 1,
            textAlign: "center",
            margin: "0",
        }
    })
);




export const Header = () => {
    const { classes } = useStyles();
    const height = 115;
    const width = height / 694 * 774;

    const { data: session } = useSession();

    return (
        <header>
            <Group className={classes.header}>
                <Stack
                    align="center"
                    spacing="1px"
                >
                    <Image
                        priority
                        src={cmlLogo}
                        height={height}
                        width={width}
                        alt="CML Logo"
                    />
                </Stack>
                <Title
                    className={classes.siteTitle}
                    order={1}
                >Celeste Mods List
                </Title>
                <Stack
                    w={width}
                    align="center"
                    spacing="1px"
                    justify="flex-end"
                >
                    {!session && (
                        <Button
                            onClick={() => { void signIn("discord"); }}
                        >
                            Login
                        </Button>
                    )}
                    {session && (
                        <>
                            <span>
                                {session.user.name}
                            </span>
                            <Button
                                onClick={() => { void signOut(); }}
                            >
                                Logout
                            </Button>
                        </>
                    )}
                </Stack>
            </Group>
        </header>
    );
};