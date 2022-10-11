import { Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../reduxApp/hooks";


export const ModDropdown = ({ modID }: { modID: number }) => {
    return <Text>{`This is mod #${modID}.`}</Text>;
}