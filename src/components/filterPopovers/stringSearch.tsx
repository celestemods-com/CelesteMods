import { ActionIcon, TextInput, createStyles, type TextInputProps } from "@mantine/core";
import { type Dispatch, type SetStateAction } from "react";
import { X, type IconProps } from "tabler-icons-react";
import { colorsForDifficultyIndex } from "~/styles/colors";




type StringSearchProps = {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    iconProps?: IconProps;
    difficultyIndex: number | null,
} & TextInputProps;


const useStyles = createStyles((_, { difficultyIndex }: { difficultyIndex: number | null }) => {
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
                padding: '10px',
                backgroundColor: colors.primary,
                // Style the arrow on top of the box.
                "+ div": {
                    backgroundColor: colors.primary,
                }
            },
            root: {
                "&&&&": {
                    color: "white",
                }
            },
            wrapper: {
                borderColor: 'white',
                "&&&& button": {
                    color: "white",
                },
            },
            input: {
                "&&&&": {
                    color: 'white',
                    borderColor: 'white',
                    backgroundColor: 'transparent',
                },
                "::placeholder": {
                    color: "white",
                },
            },
            label: {
                "&&&&": {
                    color: "white",
                }
            },
            description: {
                "&&&&": {
                    color: "white",
                }
            }
        };
    }
);

export const StringSearch = (props: StringSearchProps) => {
    const { classes } = useStyles({ difficultyIndex: props.difficultyIndex });

    return (
        <div className={classes.box}>
            <TextInput
                {...props}
                classNames={{
                    root: classes.root,
                    wrapper: classes.wrapper,
                    input: classes.input,
                    label: classes.label,
                    description: classes.description,
                }}
                onChange={(event) => props.setValue(event.currentTarget.value)}
                rightSection={
                    <ActionIcon
                        variant="light"
                        onClick={() => props.setValue("")}
                    >
                        <X
                            {...props.iconProps}
                            size={props.iconProps?.size ?? 18   /*TODO!!: get this from MantineTheme*/}
                            strokeWidth={props.iconProps?.strokeWidth ?? 1.5}
                            color={props.iconProps?.color ?? "white"}
                        />
                    </ActionIcon>
                }
            />
        </div>
    );
};