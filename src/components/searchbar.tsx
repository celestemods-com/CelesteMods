import { TextInput } from "@mantine/core";




export type SearchbarProps<String = string> = {
    value?: String;
    setValue?: (newValue: String) => void;
};




export default function Searchbar({ value, setValue }: SearchbarProps) {
    return (
        <TextInput
            value={value}
            onChange={
                setValue ?
                    (event) => setValue(event.currentTarget.value) :
                    undefined
            }
        />
    );
};