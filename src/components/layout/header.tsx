import Link from "next/link";
import { Box, Group, Flex, createStyles, Title, Button, ActionIcon } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import cmlLogo from "~/../public/images/logo/cml_logo.png";
import { Settings } from "tabler-icons-react";
import { blackBackgroundColor, blackBackgroundHoverColor } from "~/styles/layoutColors";
import { COMING_SOON_PATHNAME } from "~/consts/pathnames";
import { colorObject } from "~/styles/colorObjects";




const useStyles = createStyles(
    (theme) => {
        return ({
            header: {
                color: theme.white,
            },
            headerGroup: {
                backgroundColor: blackBackgroundColor,
                padding: "10px 45px",   /*top and bottom | left and right*/
            },
            siteTitle: {
                fontSize: "45px",
                flexGrow: 1,
                textAlign: "center",
                margin: "0",
            },
            iconLink: {
                padding: "0 4px 0 0",   /* top | right | bottom | left */
            },
            userSettingsGroup: {
                padding: "4px 2px 4px 4px",   /* top | right | bottom | left */
                columnGap: "5px",
                borderRadius: "4px",
                ":hover": {
                    backgroundColor: blackBackgroundHoverColor,
                },
                "&&&&&": {
                    ":active": {
                        transform: "translateY(0.0625rem)",
                    },
                },
            },
            userName: {
                ":active": {
                    transform: "none",
                },
            },
            icon: colorObject(theme.white),
            iconInLink: {
                margin: "2px",
            },
            iconNotInLink: {
                padding: "4px 6px",    /* top and bottom | left and right */
            },
        });
    },
);




const USER_SETTINGS_ARIA_LABEL = "User settings";


const SettingsIcon = ({
    className,
}: {
    className: string;
}) => (
    <Settings
        className={className}
        strokeWidth={2}
    />
);




export const Header = () => {
    const HEIGHT = 115;
    const width = HEIGHT / 694 * 774;


    const { data: session } = useSession();


    const { classes, cx } = useStyles();


    return (
        <header
            className={classes.header}
        >
            <Group
                className={classes.headerGroup}  /* Must use a class to assign `backgroundColor` and `padding, as `Group` doesn't expose a `backgroundColor` prop.  */
                grow
                align="center"
                position="apart"    /* justify-content = space-between */
            >
                <Flex
                    gap="1px 1px" /*row-gap column-gap*/
                    justify="start"
                >
                    <Image
                        priority
                        src={cmlLogo}
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
                    gap="1px 1px" /*row-gap column-gap*/
                    justify="end"
                    w={width}
                >
                    {session && (
                        <>
                            <Link
                                className={classes.iconLink}
                                href={COMING_SOON_PATHNAME}
                            >
                                <Group
                                    className={classes.userSettingsGroup}
                                    align="center"
                                    position="apart"
                                >
                                    <span
                                        className={classes.userName}
                                    >
                                        {session.user.name}
                                    </span>
                                    <SettingsIcon
                                        className={cx(classes.icon, classes.iconInLink)}
                                    />
                                </Group>
                            </Link>
                            <Button
                                onClick={() => { void signOut(); }}
                            >
                                Logout
                            </Button>
                        </>
                    )}
                    {!session && (
                        <>
                            <Box
                                className={classes.iconNotInLink}
                            >
                                <ActionIcon>
                                    <SettingsIcon
                                        className={classes.icon}
                                    />
                                </ActionIcon>
                            </Box>
                            <Button
                                onClick={() => { void signIn("discord"); }}
                            >
                                Login
                            </Button>
                        </>
                    )}
                </Flex>
            </Group>
        </header >
    );
};