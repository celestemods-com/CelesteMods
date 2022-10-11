import { Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../reduxApp/hooks";


export const ModDropdown = () => {
    const modID = Number(useParams().modID!);

    if (isNaN(modID)) throw "modID is NaN";

    return <Text>{`This is mod #${modID}.`}</Text>;
}