import { Group, Flex, createStyles, Title, Button } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import cmlLogo from "~/../public/images/logo/cml_logo.png";
import { blackBackgroundColor } from "~/styles/layoutColors";




const useStyles = createStyles(
    (theme) => ({
        header: {
            color: theme.white,
        },
        group: {
            backgroundColor: blackBackgroundColor,
            padding: "10px 45px",   /*top and bottom | left and right*/
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
        <header
            className={classes.header}
        >
            <Group
                className={classes.group}  /* Use a class to assign `backgroundColor`, as `Group` doesn't expose a `backgroundColor` prop.  */
                align="center"
                grow
                position="apart"
            >
                <Flex
                    gap="1px 1px" /*row-gap column-gap*/
                    justify="start"
                >
                    <Image
                        priority
                        src={cmlLogo}
                        // height={height}
                        width={width}
                        alt="CML Logo"
                    />
                </Flex>
                <Title
                    className={classes.siteTitle}
                    order={1}
                >Celeste Mods List
                </Title>
                <Flex
                    w={width}
                    gap="1px 1px" /*row-gap column-gap*/
                    justify="end"
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
                </Flex>
            </Group>
        </header >
    );
};