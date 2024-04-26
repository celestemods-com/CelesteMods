import { Tooltip, Text, type MantineNumberSize } from "@mantine/core";
import { punctuationAndSymbolsRegexPattern } from "~/utils/regex";



/** Contains the string that will be inserted between `label` and `text`. */
export const SEPARATOR_STRING = ": ";


const DROPDOWN_TEXT_SIZE: MantineNumberSize = "xs";
const TARGET_TEXT_SIZE: MantineNumberSize = "sm";




// styles are defined in ~/styles/globals.css




export type TextAndLabel = {
    text: string;
    label?: string;
};

type ModsTableTooltipProps_Base = {
    dropdownStrings: TextAndLabel;
    multiline?: boolean;
    maxWidth?: number;
};

type ModsTableTooltipProps = (
    {
        prefixDropdownWithTarget: boolean;
        targetStrings: {
            textForDropdown?: string;
        } & TextAndLabel;
        childComponent?: never;
    } | {
        prefixDropdownWithTarget?: never;
        targetStrings?: never;
        childComponent: JSX.Element;

    }
) & ModsTableTooltipProps_Base;




const Label = ({ label }: { label: TextAndLabel["label"]; }) => {
    if (!label) return;

    return (
        <Text
            span
            fw={700}
        >
            {`${label}: `}
        </Text>
    );
};


const TextAndLabel = ({ text, label }: TextAndLabel) => {
    if (!label) return text;

    if (text === "") return "";

    return (
        <>
            <Label
                label={label}
            />
            {
                punctuationAndSymbolsRegexPattern.test(text) ?    // if the text doesn't end with punctuation or symbols, add a period
                    text :
                    `${text}.`
            }
        </>
    );
};


/** `target` must be able to accept a `ref`. */
export const ModsTableTooltip = ({
    targetStrings,
    prefixDropdownWithTarget,
    childComponent,
    dropdownStrings,
    multiline = false,  // I couldn't make multiline work with static tooltips so we are using floating for now. we could also use a popover styled like a tooltip.
    maxWidth,
}: ModsTableTooltipProps) => {
    const defaultDropdownComponent = (
        <Text
            size={DROPDOWN_TEXT_SIZE}
        >
            <TextAndLabel
                text={dropdownStrings.text}
                label={dropdownStrings.label}
            />
        </Text>
    );

    return (
        <Tooltip.Floating
            // offset={12}  // re-enable when multiline works with static tooltips
            multiline={multiline}
            width={maxWidth}
            withinPortal    // disabling this would make styling simpler, but it makes the tooltip look a bit jittery
            label={         // onMouseEnter and onMouseLeave don't work for static tooltips for some reason
                childComponent ? (
                    defaultDropdownComponent
                ) : (
                    prefixDropdownWithTarget ? (
                        <Text
                            size={DROPDOWN_TEXT_SIZE}
                        >
                            <TextAndLabel
                                text={
                                    targetStrings.textForDropdown ?
                                        targetStrings.textForDropdown :
                                        targetStrings.text
                                }
                                label={targetStrings.label}
                            />
                            {" "}
                            <TextAndLabel
                                text={dropdownStrings.text}
                                label={dropdownStrings.label}
                            />
                        </Text>
                    ) : (
                        defaultDropdownComponent
                    )
                )
            }
        >
            {
                childComponent ?
                    childComponent : (
                        <Text
                            size={TARGET_TEXT_SIZE}
                        >
                            {targetStrings.text}
                        </Text>
                    )
            }
        </Tooltip.Floating>
    );
};