import { Group, Title } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import Searchbar, { SearchbarProps } from "./searchbar";




export type PageHeaderProps = {
    title: string;
} & SearchbarProps;




export default function PageHeader({ title, value, setValue }: PageHeaderProps) {
    return (
        <Group>
            <Title order={1}>{title}</Title>
            <Searchbar value={value} setValue={setValue}/>
        </Group>
    );
};