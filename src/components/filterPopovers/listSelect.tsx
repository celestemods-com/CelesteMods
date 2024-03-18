import type { Dispatch, SetStateAction } from "react";
import { MultiSelect, createStyles } from "@mantine/core";
import { colorsForDifficultyIndex } from "~/styles/modsColors";




const useStyles = createStyles(
    (
        _theme,
        { difficultyIndex }: { difficultyIndex: number | null; }
    ) => {
        if (difficultyIndex === null) {
            return {
                defaultValue: {},
                input: {},
                dropdown: {},
                item: {},
                root: {},
                rightSection: {},
            };
        }


        const colors = colorsForDifficultyIndex(difficultyIndex);


        return {
            defaultValue: {
                "&&&&": {
                    backgroundColor: colors.primaryHover.backgroundColor, // highlight color for selected items
                    color: colors.primaryHover.textColor,
                },
                "&&&& button": {
                    color: colors.primaryHover.textColor,
                },
            },
            input: {
                "&&&&": {
                    backgroundColor: colors.primary.backgroundColor, // dropdown parent
                    color: colors.primary.textColor, // this doesn't seem to be used
                },
                "&&&& input::placeholder": {
                    color: colors.primary.textColor,
                },
            },
            dropdown: {
                "&&&&": {
                    backgroundColor: colors.primary.backgroundColor, // dropdown
                },
            },
            item: {
                "&&&&": {
                    color: colors.primary.textColor,
                },
                "&&&&[data-hovered]": {
                    backgroundColor: colors.primaryHover.backgroundColor, // highlight color for hovered items in dropdown
                    color: colors.primaryHover.textColor,
                },
            },
            root: {
                // Style the arrow on top of the box.
                "+ div": {
                    backgroundColor: colors.primary.backgroundColor,
                },
            },
            rightSection: {
                "&&&& path": {
                    color: colors.primary.textColor,
                },
            },
        };
    },
);




type ListSearchProps<T extends string> = {
    permittedStrings: T[];
    selectedStrings: T[];
    setSelectedStrings: Dispatch<SetStateAction<T[]>>;
    maxDropdownHeight?: number;
    difficultyIndex: number | null;
};




export const ListSelect = <T extends string>({ permittedStrings, selectedStrings, setSelectedStrings, difficultyIndex, maxDropdownHeight = 200 }: ListSearchProps<T>) => {
    const { classes } = useStyles({ difficultyIndex });


    return (
        <MultiSelect
            data={permittedStrings}
            value={selectedStrings}
            onChange={setSelectedStrings as Dispatch<SetStateAction<string[]>>} //widen type to play nicely with library component
            placeholder="Pick values"
            clearable
            maxDropdownHeight={maxDropdownHeight}
            classNames={{
                defaultValue: classes.defaultValue,
                input: classes.input,
                dropdown: classes.dropdown,
                item: classes.item,
                root: classes.root,
                rightSection: classes.rightSection,
            }}
        />
    );
};