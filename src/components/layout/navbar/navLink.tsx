import { Flex, createStyles } from "@mantine/core";
import Link from "next/link";




const useStyles = createStyles((theme) => ({
    navLink: {
        width: "150px",
        height: "40px",
        position: "relative",
    },
    navLinkLabel: {
        backgroundColor: "#263972",
        color: theme.white,
        flexGrow: 1,
        fontSize: '17px',
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
    },
    activeNavLink: {
        position: "absolute",
        right: "-40px",
    },
}));




export type NavLinkData = {
    label: string;
    pathname: string;
};


type NavLinkProps = {
    active: boolean;
} & NavLinkData;




export const NavLink = ({ label, pathname, active }: NavLinkProps) => {
    const { classes } = useStyles();


    return (
        <Link href={pathname}>
            <Flex className={classes.navLink}>
                <svg
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    width="40px"
                    height="40px"
                    fill="#263972"
                >
                    <polygon points="0,0 100,0 100,100 0,100 100,50" />
                </svg>
                <span className={classes.navLinkLabel}>
                    {label}
                </span>
                {active && (
                    <svg
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        width="40px"
                        height="40px"
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