import { ActionIcon, TextInput, type TextInputProps } from "@mantine/core";
import { type Dispatch, type SetStateAction } from "react";
import { X, type IconProps } from "tabler-icons-react";




type StringSearchProps = {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    iconProps?: IconProps;
} & TextInputProps;




const StringSearch = (props: StringSearchProps) => {
    return (
        <TextInput
            {...props}
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
                        color={props.iconProps?.color ?? "gray"}
                    />
                </ActionIcon>
            }
        />
    );
};


export default StringSearch;