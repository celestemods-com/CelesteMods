import { Text } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../../../reduxApp/hooks";


export const ModDropdownHeader = ({ modID }: { modID: number }) => {
    return <Text>{`This is the mod dropdown header for mod ${modID}`}</Text>;
}