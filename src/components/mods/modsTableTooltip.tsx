import { Tooltip, Text, type MantineNumberSize } from "@mantine/core";
import { punctuationAndSymbolsRegexPattern } from "~/utils/regex";



/** Contains the string that will be inserted between `label` and `text`. */
export const SEPARATOR_STRING = ": ";


const DROPDOWN_TEXT_SIZE: MantineNumberSize = "xs";
const TARGET_TEXT_SIZE: MantineNumberSize = "sm";




// styles are defined in ~/styles/globals.css




export type AddPeriodToText_Base = boolean;
type Label = string;


type TextAndLabel_Base = {
    text: string;
    label?: Label;
};

type TextAndLabel_Dropdown = (
    {
        addPeriodToText: AddPeriodToText_Base;
    }
) & TextAndLabel_Base;

type TextAndLabel_Target = (
    {
        addPeriodToText: {
            dropdown: AddPeriodToText_Base;
            target: AddPeriodToText_Base;
        } | AddPeriodToText_Base;
    }
) & TextAndLabel_Base;

type TextAndLabel = TextAndLabel_Dropdown | TextAndLabel_Target;

export type AddPeriodToText_Union = TextAndLabel["addPeriodToText"];


type ModsTableTooltipProps_Base = {
    dropdownStrings: TextAndLabel_Dropdown;
    multiline?: boolean;
    maxWidth?: number;
};

type ModsTableTooltipProps = (
    {
        childComponent?: never;
        prefixDropdownWithTarget: boolean;
        targetStrings: {
            textForDropdown?: string;
        } & TextAndLabel_Target;
    } | {
        childComponent: JSX.Element;
        prefixDropdownWithTarget?: never;
        targetStrings?: never;
    }
) & ModsTableTooltipProps_Base;




const Label = (
    { label }: { label: Label; }
) => {
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


const TextAndLabel = (
    {
        text,
        label,
        addPeriodToText,
    }: TextAndLabel
) => {
    if (!label) return text;

    if (text === "") return "";

    return (
        <>
            <Label
                label={label}
            />
            {
                addPeriodToText && !punctuationAndSymbolsRegexPattern.test(text.slice(-1)) ?    // if addPeriodToText === true and the last character of text doesn't end with punctuation or symbols, add a period
                    `${text}.` :
                    text
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
                addPeriodToText={dropdownStrings.addPeriodToText}
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
                                addPeriodToText={
                                    typeof targetStrings.addPeriodToText === "object" ?
                                        targetStrings.addPeriodToText.dropdown :
                                        targetStrings.addPeriodToText
                                }
                            />
                            {" "}
                            <TextAndLabel
                                text={dropdownStrings.text}
                                label={dropdownStrings.label}
                                addPeriodToText={dropdownStrings.addPeriodToText}
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
                            <TextAndLabel
                                text={targetStrings.text}
                                addPeriodToText={
                                    typeof targetStrings.addPeriodToText === "object" ?
                                        targetStrings.addPeriodToText.target :
                                        targetStrings.addPeriodToText
                                }
                            />
                        </Text>
                    )
            }
        </Tooltip.Floating>
    );
};