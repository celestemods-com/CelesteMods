import { ActionIcon, TextInput, createStyles, type TextInputProps } from "@mantine/core";
import type { Dispatch, SetStateAction } from "react";
import { X, type IconProps } from "tabler-icons-react";
import { colorsForDifficultyIndex } from "~/styles/modsColors";




const useStyles = createStyles(
    (
        _theme,
        { difficultyIndex }: { difficultyIndex: number | null; }
    ) => {
        if (difficultyIndex === null) {
            return {
                box: {},
                root: {},
                wrapper: {},
                input: {},
                label: {},
                description: {},
            };
        }


        const colors = colorsForDifficultyIndex(difficultyIndex);


        return {
            box: {
                padding: "10px",
                backgroundColor: colors.primary.backgroundColor, // filter popover
                // Style the arrow on top of the box.
                "+ div": {
                    backgroundColor: colors.primary.backgroundColor,
                }
            },
            root: {
                "&&&&": {
                    color: colors.primary.textColor,    // this doesn't seem to be used
                }
            },
            wrapper: {
                borderColor: colors.primary.textColor,  // this doesn't seem to be used
                "&&&& button": {
                    color: colors.primary.textColor,    // this doesn't seem to be used
                },
            },
            input: {
                "&&&&": {
                    color: colors.primary.textColor,
                    borderColor: colors.primary.textColor,
                    backgroundColor: "transparent",
                },
                "::placeholder": {
                    color: colors.primary.textColor,
                },
            },
            label: {
                "&&&&": {
                    color: colors.primary.textColor,    // this doesn't seem to be used
                }
            },
            description: {
                "&&&&": {
                    color: "red",    // this doesn't seem to be used
                }
            },
        };
    },
);




type StringSearchProps = {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    iconProps?: IconProps;
    difficultyIndex: number | null,
} & TextInputProps;




export const StringSearch = ({ value, setValue, iconProps, difficultyIndex }: StringSearchProps) => {
    const { classes } = useStyles({ difficultyIndex: difficultyIndex });


    return (
        <div className={classes.box}>
            <TextInput
                value={value}
                classNames={{
                    root: classes.root,
                    wrapper: classes.wrapper,
                    input: classes.input,
                    label: classes.label,
                    description: classes.description,
                }}
                onChange={(event) => setValue(event.currentTarget.value)}
                rightSection={
                    <ActionIcon
                        variant="light"
                        onClick={() => setValue("")}
                    >
                        <X
                            {...iconProps}
                            size={iconProps?.size ?? 18   /*TODO!!: get this from MantineTheme*/}
                            strokeWidth={iconProps?.strokeWidth ?? 1.5}
                            color={iconProps?.color ?? "white"}
                        />
                    </ActionIcon>
                }
            />
        </div>
    );
};