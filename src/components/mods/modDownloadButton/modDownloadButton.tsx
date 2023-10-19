import { useGamebananaModDownloadUrl, GAMEBANANA_OLYMPUS_ICON_URL } from "~/hooks/gamebananaApi";
import { Text } from "@mantine/core";





type ModDownloadButtonProps = {
    gamebananaModId: number;
};




const ModDownloadButton = ({ gamebananaModId }: ModDownloadButtonProps) => {
    const { downloadUrl } = useGamebananaModDownloadUrl({ gamebananaModId });


    return (        //TODO: add popover with info about the installer
        <a href={downloadUrl    /*TODO!: implement useGamebananaModDownloadUrl */}>
            <Text size={"md"}>
                Olympus: 1-Click Install
            </Text>
        </a>
    );
};


export default ModDownloadButton;