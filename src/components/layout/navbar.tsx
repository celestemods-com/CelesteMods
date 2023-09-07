import { Flex, Stack, createStyles } from "@mantine/core";
import Link from "next/link";


const useStyles = createStyles((theme) => ({
    navLink: {
        width: "125px",
        height: "35px",
        position: "relative",
    },
    navLinkLabel: {
        backgroundColor: "#263972",
        color: theme.white,
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
    },
    activeNavLink: {
        position: "absolute",
        right: "-35px",
    },
}));


type NavLinkProps = {
    label: string;
    pathname: string;
    active: boolean;
};


const NavLink = ({ label, pathname, active }: NavLinkProps) => {
    const { classes } = useStyles();


    return (
        <Link href={pathname}>
            <Flex className={classes.navLink}>
                <svg
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    width="35px"
                    height="35px"
                    fill="#263972"
                >
                    <polygon points="0,0 100,0 100,100 0,100 100,50" />
                </svg>
                <span className={classes.navLinkLabel}>{label}</span>
                {active && (
                    <svg
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        width="35px"
                        height="35px"
                        fill="#263972"
                        className={classes.activeNavLink}
                    >
                        <polygon points="0,0 100,50 0,100" />
                    </svg>
                )}
            </Flex>
        </Link>
    );
};


type NavLinkData = {
    label: string;
    pathname: string;
};


export type NavbarProps = {
    pathname: string;
    pages: [NavLinkData, ...NavLinkData[]];
};


export function Navbar({ pathname, pages }: NavbarProps) {
    return (
        <nav>
            <Stack spacing="xs" align="end">
                {pages.map((page, i) => {
                    return (
                        <NavLink
                        key={i}
                        label={page.label}
                        pathname={page.pathname}
                        active={pathname === page.pathname}
                        />
                    );
                })}
            </Stack>
        </nav>
    );
}
