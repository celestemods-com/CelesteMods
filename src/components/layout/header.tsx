import { Flex, createStyles } from "@mantine/core";
import Image from "next/image";


const useStyles = createStyles((_) => ({
    header: {
        color: "white",
        backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
        padding: "10px 45px",
    },
}));


export function Header() {
    const { classes } = useStyles();


    return (
        <header>
            <Flex className={classes.header}>
                <Image
                    priority
                    src="/images/logo/cml_logo.png"
                    height={100}
                    width={110}
                    alt="logo"
                />
                <h1>Celeste Mods List</h1>
            </Flex>
        </header>
    );
}
