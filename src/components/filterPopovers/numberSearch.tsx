import { type Dispatch, type SetStateAction } from "react";
import { NumberInput, Stack, type NumberInputProps } from "@mantine/core";




type MapCountRange = [number | undefined, number | undefined];  //[min, max]

type NumberSearchProps = {
    range: MapCountRange;
    setRange: Dispatch<SetStateAction<MapCountRange>>;
    maxProps?: NumberInputProps;
    minProps?: NumberInputProps;
};




export const NumberSearch = ({ range, setRange, maxProps, minProps }: NumberSearchProps) => {


    return (
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
            />
        </Stack>
    );
};