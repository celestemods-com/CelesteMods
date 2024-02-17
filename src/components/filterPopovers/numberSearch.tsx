import { type Dispatch, type SetStateAction } from "react";
import { NumberInput, Stack, type NumberInputProps, createStyles } from "@mantine/core";
import { colorsForDifficultyIndex } from "~/styles/colors";




type MapCountRange = [number | undefined, number | undefined];  //[min, max]

type NumberSearchProps = {
    range: MapCountRange;
    setRange: Dispatch<SetStateAction<MapCountRange>>;
    maxProps?: NumberInputProps;
    minProps?: NumberInputProps;
    difficultyIndex: number | null;
};

const useStyles = createStyles((_, { difficultyIndex }: { difficultyIndex: number | null }) => {
    if (difficultyIndex === null) {
        return {
            box: {},
            root: {},
            label: {},
            description: {},
            input: {},
            control: {},
        };
    }

    const colors = colorsForDifficultyIndex(difficultyIndex);
    return {
        box: {
            padding: '10px',
            backgroundColor: colors.primary,
            "label": {
                color: "white",
            },
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
        label: {
            "&&&&": {
                color: "white",
            }
        },
        description: {
            "&&&&": {
                color: "white",
            }
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
        control: {
            "&&&&": {
                color: "white",
                border: "none",
                ":hover": {
                    backgroundColor: colors.primaryHover2,
                }
            },
        }
    };
}
);


export const NumberSearch = ({ range, setRange, maxProps, minProps, difficultyIndex }: NumberSearchProps) => {
    const { classes } = useStyles({ difficultyIndex });

    return (
        <div className={classes.box}>
            <Stack>
                <NumberInput
                    {...maxProps}
                    value={range[1]     /*Max*/}
                    onChange={
                        (newValue) => setRange([
                            range[0],
                            typeof newValue === "number" ? newValue : undefined,
                        ])
                    }
                    classNames={{
                        description: classes.description,
                        input: classes.input,
                        control: classes.control,
                    }}
                />
                <NumberInput
                    {...minProps}
                    value={range[0]     /*Min*/}
                    onChange={
                        (newValue) => setRange([
                            typeof newValue === "number" ? newValue : undefined,
                            range[1],
                        ])
                    }
                    classNames={{
                        description: classes.description,
                        input: classes.input,
                        control: classes.control,
                    }}
                />
            </Stack>
        </div>
    );
};