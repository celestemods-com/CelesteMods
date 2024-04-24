import { Tooltip, Text } from "@mantine/core";


// styles are defined in ~/styles/globals.css


type ModsTableTooltipProps_Base = {
    dropdownString: string;
    multiline?: boolean;
    maxWidth?: number;
};

type ModsTableTooltipProps = (
    {
        targetString: string;
        childComponent?: never;
    } | {
        targetString?: never;
        childComponent: JSX.Element;

    }
) & ModsTableTooltipProps_Base;




/** `target` must be able to accept a `ref`. */
export const ModsTableTooltip = ({
    targetString,
    childComponent,
    dropdownString,
    multiline = false,  // I couldn't make multiline work with static tooltips so we are using floating for now. we could also use a popover styled like a tooltip.
    maxWidth,
}: ModsTableTooltipProps) => {

    return (
        <Tooltip.Floating
            // offset={12}  // re-enable when multiline works with static tooltips
            multiline={multiline}
            width={maxWidth}
            withinPortal    // disabling this would make styling simpler, but it makes the tooltip look a bit jittery
            label={
                <Text       // onMouseEnter and onMouseLeave don't work for static tooltips for some reason
                    size="xs"
                >
                    {dropdownString}
                </Text>
            }
        >
            {
                childComponent ?
                    childComponent : (
                        <Text
                            size="sm"
                        >
                            {targetString}
                        </Text>
                    )
            }
        </Tooltip.Floating>
    );
};