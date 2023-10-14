import { useGamebananaModDownloadUrl, GAMEBANANA_OLYMPUS_ICON_URL } from "~/hooks/gamebananaApi";
import { createStyles } from "@mantine/core";
import { Image, Stack, Group, Title, Text } from "@mantine/core";      //TODO!: replace with nextjs Image component once next.config.mjs is fixed
// import Image from "next/image";
import { api } from "~/utils/api";





const useStyles = createStyles(
    (_theme) => ({
        modDownloadButton: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                maxWidth: "550px",
                backgroundColor: "rgba(1.0, 1.0, 1.0, 0.9)",
                padding: "3px",
                borderRadius: "2px"
            },
        },
        olympusText: {
            color: "rgb(235, 207, 52)",
            fontSize: "0.9rem",
        },
        clickText: {
            color: "white",
            fontWeight: "bold",
            fontSize: "0.9rem",
        }
    }),
);





type ModDownloadButtonProps = {
    gamebananaModId: number;
};




const ModDownloadButton = ({ gamebananaModId }: ModDownloadButtonProps) => {
    const { downloadUrl } = useGamebananaModDownloadUrl({ gamebananaModId });


    const { cx, classes } = useStyles();

    return (        //TODO: add popover with info about the installer
        <a href={downloadUrl    /*TODO!: implement useGamebananaModDownloadUrl */}>      
            <Group position="center" align="center" className={classes.modDownloadButton}>
                <Image
                    src={GAMEBANANA_OLYMPUS_ICON_URL}
                    alt="Olympus Icon"
                    width={40}
                    height={40}
                />
                <Stack spacing="0">
                    <Title
                        order={4}
                        align="left"
                        className={classes.olympusText}
                    >
                        Olympus - Everest Installer
                    </Title>
                    <Text align="left" className={classes.clickText}>
                        1-CLICK INSTALL
                    </Text>
                </Stack>
            </Group>
        </a>
    );
};


export default ModDownloadButton;