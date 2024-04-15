import { useEffect, useState, type SetStateAction, type RefObject } from "react";
import { createPortal } from "react-dom";
import { createStyles } from "@mantine/core";
import { canonicalDifficultyNames } from "~/styles/difficultyColors";
import { difficultyColors, type DifficultyColor } from "~/styles/difficultyColors";
import { blackBackgroundColor } from "~/styles/layoutColors";




const useStyles = createStyles(
    (
        _theme,
        { colors }: { colors: DifficultyColor; },
    ) => {
        return ({
            tabContainer: {
                position: "sticky",
                top: "0",
                zIndex: 2,
                display: "flex",
                justifyContent: "end",
                padding: "0 15px",
                backgroundColor: blackBackgroundColor,
            },
            tab: {
                padding: "1px 20px",
                display: "inline-block",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                borderTop: "2px",
                borderTopStyle: "solid",
                borderTopColor: "transparent",
                fontSize: "medium",
                cursor: "pointer",
                fontWeight: "bold",
            },
            activeTab: {
                borderTopColor: `${colors.primaryHover.backgroundColor}`,  // add top border to active tab so it's easier to see which tab is active (the contrast ratio between the difficulty colors is not sufficient on its own)
            },
            // color the difficulty tabs
            beginner: {
                backgroundColor: difficultyColors.beginner.primary.backgroundColor,
                color: difficultyColors.beginner.primary.textColor,
                ":hover": {
                    backgroundColor: difficultyColors.beginner.primaryHover.backgroundColor,
                    color: difficultyColors.beginner.primaryHover.textColor,
                },
            },
            intermediate: {
                backgroundColor: difficultyColors.intermediate.primary.backgroundColor,
                color: difficultyColors.intermediate.primary.textColor,
                ":hover": {
                    backgroundColor: difficultyColors.intermediate.primaryHover.backgroundColor,
                    color: difficultyColors.intermediate.primaryHover.textColor,
                },
            },
            advanced: {
                backgroundColor: difficultyColors.advanced.primary.backgroundColor,
                color: difficultyColors.advanced.primary.textColor,
                ":hover": {
                    backgroundColor: difficultyColors.advanced.primaryHover.backgroundColor,
                    color: difficultyColors.advanced.primaryHover.textColor,
                },
            },
            expert: {
                backgroundColor: difficultyColors.expert.primary.backgroundColor,
                color: difficultyColors.expert.primary.textColor,
                ":hover": {
                    backgroundColor: difficultyColors.expert.primaryHover.backgroundColor,
                    color: difficultyColors.expert.primaryHover.textColor,
                },
            },
            grandmaster: {
                backgroundColor: difficultyColors.grandmaster.primary.backgroundColor,
                color: difficultyColors.grandmaster.primary.textColor,
                ":hover": {
                    backgroundColor: difficultyColors.grandmaster.primaryHover.backgroundColor,
                    color: difficultyColors.grandmaster.primaryHover.textColor,
                },
            },
            astral: {
                backgroundColor: difficultyColors.astral.primary.backgroundColor,
                color: difficultyColors.astral.primary.textColor,
                ":hover": {
                    backgroundColor: difficultyColors.astral.primaryHover.backgroundColor,
                    color: difficultyColors.astral.primaryHover.textColor,
                },
            },
            celestial: {
                backgroundColor: difficultyColors.celestial.primary.backgroundColor,
                color: difficultyColors.celestial.primary.textColor,
                ":hover": {
                    backgroundColor: difficultyColors.celestial.primaryHover.backgroundColor,
                    color: difficultyColors.celestial.primaryHover.textColor,
                },
            },
        });
    }
);




type CurrentTabIndex = number | null;

type DifficultyTabsProps = {
    colors: DifficultyColor;
    tableBodyRef: RefObject<HTMLTableSectionElement>;
    parentDifficultyNames: string[];
    currentTabIndex: CurrentTabIndex;
    setCurrentTabIndex: (value: SetStateAction<CurrentTabIndex>) => void;
};




export const DifficultyTabs = ({
    colors,
    tableBodyRef,
    parentDifficultyNames,
    currentTabIndex,
    setCurrentTabIndex,
}: DifficultyTabsProps) => {
    const { cx, classes } = useStyles({ colors });


    const tabColors: string[] = Array(canonicalDifficultyNames.length);

    Object.entries(classes).forEach(
        ([key, value]) => {
            for (let index = 0; index < canonicalDifficultyNames.length; index++) {
                if (key === canonicalDifficultyNames[index]) {
                    tabColors[index] = value;
                    break;
                }
            }
        }
    );


    // We want to render the tab container inside the scroll area of the datatable, so we use ref and portal.
    const [tabContainer, setTabContainer] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        const tabsParent = tableBodyRef.current?.parentElement?.parentElement;

        if (!tabsParent) {
            throw "Couldn't find tabsParent.";
        }


        const tabContainer = document.createElement("div");

        tabContainer.className = classes.tabContainer;

        tabsParent.prepend(tabContainer);

        setTabContainer(tabContainer);


        return () => {
            tabsParent.removeChild(tabContainer);

            setTabContainer(null);
        };
    }, [classes.tabContainer]);


    return (
        tabContainer !== null && (
            createPortal(
                [...parentDifficultyNames].reverse().map(
                    (name, index) =>
                        <span
                            key={name}
                            className={
                                cx(
                                    classes.tab,
                                    tabColors[parentDifficultyNames.length - 1 - index],
                                    { [classes.activeTab]: parentDifficultyNames.length - 1 - index === currentTabIndex }
                                )
                            }
                            onClick={() => {
                                setCurrentTabIndex(parentDifficultyNames.length - 1 - index);
                            }}
                        >
                            {name}
                        </span>
                ),
                tabContainer
            )
        )
    );
};