import type { Dispatch, SetStateAction } from "react";
import { MultiSelect, createStyles } from "@mantine/core";
import { colorsForDifficultyIndex } from "~/styles/colors";




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
                    color: "white",
                    backgroundColor: colors.primaryHover1,
                },
                "&&&& button": {
                    color: "white",
                }
            },
            input: {
                "&&&&": {
                    backgroundColor: colors.primary,
                    color: "white",
                },
                "&&&& input::placeholder": {
                    color: "white",
                }
            },
            dropdown: {
                "&&&&": {
                    backgroundColor: colors.primary,
                }
            },
            item: {
                "&&&&": {
                    color: "white",
                },
                "&&&&[data-hovered]": {
                    backgroundColor: colors.primaryHover2,
                }
            },
            root: {
                // Style the arrow on top of the box.
                "+ div": {
                    backgroundColor: colors.primary,
                }
            },
            rightSection: {
                "&&&& path": {
                    color: "white",
                }
            }
        };
    }
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