import { Flex, createStyles } from "@mantine/core";
import Image from "next/image";




const useStyles = createStyles(() => ({
    header: {
        color: "white",
        backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
        padding: "10px 45px",
    },
    siteTitle: {
        fontSize: '45px',
        flexGrow: 1,
        textAlign: 'center',
    }
}));




export const Header = () => {
    const { classes } = useStyles();
    const height = 150;


    return (
        <header>
            <Flex className={classes.header}>
                <Image
                    priority
                    src="/images/logo/cml_logo.png"
                    height={height}
                    width={height / 694 * 774}
                    alt="CML Logo"
                />
                <h1 className={classes.siteTitle}>Celeste Mods List</h1>
            </Flex>
        </header>
    );
};