import { Tooltip, Text } from "@mantine/core";


// styles are defined in ~/styles/globals.css


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
    multiline = false,  //TODO!!!!: figure out how to make multiline work with static tooltips and switch back to static from floating
    maxWidth,
}: ModsTableTooltipProps) => {

    return (
        <Tooltip.Floating
            // offset={12}  // re-enable when multiline works
            multiline={multiline}
            width={maxWidth}
            withinPortal    // disabling this would make styling simpler, but it makes the tooltip look a bit jittery
            label={
                <Text       // TODO!!!: figure out why onMouseEnter and onMouseLeave don't work (for static tooltips)
                    size="xs"
                >
                    {dropdownString}
                </Text>
            }
        >
            <Text
                size="sm"
            >
                {targetString}
            </Text>
        </Tooltip.Floating>
    );
};