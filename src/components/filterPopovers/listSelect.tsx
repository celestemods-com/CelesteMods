import type { Dispatch, SetStateAction } from "react";
import { MultiSelect } from "@mantine/core";

type ListSearchProps<T extends string> = {
    permittedStrings: T[];
    selectedStrings: T[];
    setSelectedStrings: Dispatch<SetStateAction<T[]>>;
    maxDropdownHeight?: number;
};




export const ListSelect = <T extends string>({ permittedStrings, selectedStrings, setSelectedStrings, maxDropdownHeight=200 }: ListSearchProps<T>) => {
    return (
        <MultiSelect
            data={permittedStrings}
            value={selectedStrings}
            onChange={setSelectedStrings as Dispatch<SetStateAction<string[]>>} //widen type to play nicely with library component
            placeholder="Pick values"
            clearable
            maxDropdownHeight={maxDropdownHeight}
        />
    );
};