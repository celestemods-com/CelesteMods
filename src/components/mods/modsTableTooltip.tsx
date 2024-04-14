import { Tooltip, Text } from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";




type ModsTableTooltipProps = {
    targetString: string;
    dropdownString: string;
    multiline?: boolean;
    maxWidth?: number;
};



/** `target` must be able to accept a `ref`. */
export const ModsTableTooltip = ({
    targetString,
    dropdownString,
    multiline = false,  //TODO!!!: figure out how to make multiline work
    maxWidth,
}: ModsTableTooltipProps) => {
    const [isOpened, { close, open }] = useDisclosure(false);

    // Since there is a gap between the link and the tooltip,
    // debouncing prevents the tooltip from closing when we move from the link to tooltip.
    const [debouncedIsOpened] = useDebouncedValue(isOpened, 200);

    return (
        <Tooltip
            offset={12}
            opened={debouncedIsOpened}
            label={
                <Text       // TODO!!!: figure out why onMouseEnter and onMouseLeave don't work
                    size="xs"
                    onMouseEnter={open}
                    onMouseLeave={close}
                >
                    {dropdownString}
                </Text>
            }
        >
            <Text
                size="sm"
                onMouseEnter={open}
                onMouseLeave={close}
            >
                {targetString}
            </Text>
        </Tooltip>
    );
};