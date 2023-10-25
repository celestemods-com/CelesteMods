import { Flex, createStyles, Title, Box } from "@mantine/core";
import Image from "next/image";
import cmlLogo from "~/../public/images/logo/cml_logo.png";




const useStyles = createStyles(() => ({
    header: {
        color: "white",
        backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
        padding: "10px 45px",
        alignItems: "center",
    },
    siteTitle: {
        fontSize: "45px",
        flexGrow: 1,
        textAlign: "center",
        margin: "0",
    }
}));




export const Header = () => {
    const { classes } = useStyles();
    const height = 150;
    const width = height / 694 * 774;


    return (
        <header>
            <Flex className={classes.header}>
                <Image
                    priority
                    src={cmlLogo}
                    height={height}
                    width={width}
                    alt="CML Logo"
                />
                <Title className={classes.siteTitle} order={1}>Celeste Mods List</Title>
                <Box w={width} />
            </Flex>
        </header>
    );
};