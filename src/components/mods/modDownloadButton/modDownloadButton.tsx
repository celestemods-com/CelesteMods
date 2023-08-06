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
            },
        },
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
            <Group position="center" align="center">
                <Image
                    src={GAMEBANANA_OLYMPUS_ICON_URL}
                    alt="Olympus Icon"
                    width={32}
                    height={32}
                />
                <Stack>
                    <Title
                        order={3}
                        align="left"
                    >
                        Olympus - Everest Installer
                    </Title>
                    <Text align="left">
                        1-CLICK INSTALL
                    </Text>
                </Stack>
            </Group>
        </a>
    );
};


export default ModDownloadButton;