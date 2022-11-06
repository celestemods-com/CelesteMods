import { Group, Tooltip, Text } from "@mantine/core";
import { selectModByID } from "../../../features/mods_maps_publishers/mods/modsSlice";
import { OneClickInstallButton } from "../../../otherComponents/OneClickInstallButton";
import { useAppSelector } from "../../../reduxApp/hooks";
import { RootState } from "../../../reduxApp/store";


export const TechDropdownHeader = ({ modID }: { modID: number }) => {
    const mod = useAppSelector((rootState: RootState) => selectModByID(rootState, modID));
    const modState = Array.isArray(mod) ? mod[0] : mod;

    const date = new Date(modState.timeCreated);


    return (
        <Group align={"center"} noWrap={false} position={"apart"}>
            <Group align={"center"} noWrap={false} position={"left"} spacing={"md"}>
                <Tooltip label={`${date.toDateString()} UTC`}>
                    <Text>Date Published: {date.toLocaleDateString()}</Text>
                </Tooltip>
                <Text>Published By: PublisherName</Text>
                <ContentWarning contentWarning={modState.contentWarning}/>
            </Group>
            <OneClickInstallButton gamebananaModID={modState.gamebananaModID}/>
        </Group>
    )
}




const ContentWarning = ({ contentWarning }: { contentWarning: boolean }) => {
    if (contentWarning) return <Text weight={"bold"}>Content Warning</Text>
    else return null;
}