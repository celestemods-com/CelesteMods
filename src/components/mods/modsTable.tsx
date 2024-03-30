import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import ExpandedMod from "~/components/mods/expandedMod";
import { createStyles } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Difficulty, Quality } from "~/components/mods/types";
import { type ModType, ModType as modTypes, type Publisher as PrismaPublisher, type Mod } from "@prisma/client";
import { StringSearch } from "~/components/filterPopovers/stringSearch";
import { NumberSearch } from "~/components/filterPopovers/numberSearch";
import { ListSelect } from "~/components/filterPopovers/listSelect";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import type { ModWithInfo, Publisher, Tech } from "~/components/mods/types";
import { noRatingsFoundMessage } from "~/consts/noRatingsFoundMessage";
import { colorsForDifficultyIndex, greatestValidDifficultyIndex } from "~/styles/modsColors";
import { canonicalDifficultyNames, difficultyColors, type DifficultyColor } from "~/styles/difficultyColors";
import { expandedModColors } from "~/styles/expandedModColors";
import { TABLE_HEADER_ARROW_ZOOM } from "~/consts/tableHeaderArrowZoom";




const PAGE_SIZES = [5, 10, 15, 20, 25, 50, 100, 250, 500, 1000];
const DEFAULT_PAGE_SIZE_INDEX = 1;
const ACTIVE_DIFFICULTY_TAB_BORDER_HEIGHT = "2px";
const QUERY_DEBOUNCE_TIME_MILLISECONDS = 200;


const useStyles = createStyles(
    (
        theme,
        { colors }: { colors: DifficultyColor; },
    ) => {
        return ({
            tabContainer: {
                padding: "0 15px",
                display: "flex",
                justifyContent: "end",
            },
            tab: {
                padding: "1px 20px",
                display: "inline-block",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                borderTop: ACTIVE_DIFFICULTY_TAB_BORDER_HEIGHT,
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
            table: {
                "&&&& table": {
                    transform: "translate(0, -21px)",
                    borderSpacing: "0 20px",
                    padding: "0 15px"
                },
                "&&&& thead": {
                    top: "20px",
                },
                "&&&& tr": {
                    backgroundColor: "transparent",
                },
                "&&&& table + div": {
                    // Removes the shadow below the table header
                    display: "none",
                },
            },
            modCell: {
                // 4 ampersands to increase selectivity of class to ensure it overrides any other css
                "&&&&": {
                    /* top | left and right | bottom */
                    padding: `${theme.spacing.sm} ${theme.spacing.xl} ${theme.spacing.sm}`,
                    backgroundColor: expandedModColors.default.backgroundColor,
                    color: expandedModColors.default.textColor,
                    borderWidth: 0,
                    fontWeight: "bold",
                },
            },
            expandedModCell: {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
            },
            header: {
                "&&&& th": {
                    fontWeight: "bold",
                    fontSize: "17px",
                    padding: "10px",
                    textAlign: "center",
                    border: "none",
                    backgroundColor: colors.primary.backgroundColor, // table header
                    color: colors.primary.textColor,
                    // The down arrow appears blurry due to rotation, so we zoom in to fix that.
                    // https://stackoverflow.com/a/53556981
                    ".mantine-Center-root": {
                        zoom: TABLE_HEADER_ARROW_ZOOM,
                    },
                    "svg": {
                        color: colors.primary.textColor, // sets the color of the arrow and of the non-hovered filter icon
                    },
                },
                "&&&& th:hover": {
                    backgroundColor: colors.primaryHover.backgroundColor, // table header hover
                    color: colors.primaryHover.textColor,
                    "svg": {
                        color: colors.primaryHover.textColor,    // sets the color of the arrow and of the non-hovered filter icon
                    },
                },
            },
            unfilteredColumnTitle: {
                "&&&& .mantine-UnstyledButton-root": {
                    border: "none",
                    ":hover": {
                        backgroundColor: colors.secondaryHover.backgroundColor,  // unfiltered column filter button hover
                        border: "2px solid",
                        borderColor: colors.secondaryHover.textColor,
                        "svg": {
                            color: colors.secondaryHover.textColor,
                        },
                    },
                },
            },
            filteredColumnTitle: {
                "&&&& .mantine-UnstyledButton-root": {
                    border: "none",
                    backgroundColor: colors.secondary.backgroundColor, // filtered column filter button
                    "svg": {
                        color: `${colors.secondary.textColor} !important`,   // !important to override the color set by the `header` class
                    },
                    ":hover": {
                        backgroundColor: colors.secondaryHover.backgroundColor, // filtered column filter button hover
                        border: "2px solid",
                        borderColor: colors.secondaryHover.textColor,
                        "svg": {
                            color: `${colors.secondaryHover.textColor} !important`,  // !important to override the color set by the `header` class
                        },
                    },
                },
            },
            leftColumnCell: {
                borderTopLeftRadius: "50px",
                borderBottomLeftRadius: "50px",
            },
            rightColumnCell: {
                borderTopRightRadius: "50px",
                borderBottomRightRadius: "50px",
            },
            pagination: {
                backgroundColor: colors.primary.backgroundColor, // table footer
                color: colors.primary.textColor,
                "&&&& button": {
                    backgroundColor: colors.primary.backgroundColor, // default pagination button
                    border: "2px solid",
                    borderColor: colors.primaryHover.backgroundColor,
                    color: colors.primary.textColor,
                },
                "&&&& button:hover": {
                    backgroundColor: colors.primaryHover.backgroundColor, // default pagination button hover
                    color: colors.primaryHover.textColor,
                },
                "&&&&& button[data-active]": {
                    backgroundColor: colors.secondary.backgroundColor, // active pagination button
                    borderColor: "transparent",
                    color: colors.secondary.textColor,
                },
                "&&&&& button[data-active]:hover": {
                    backgroundColor: colors.secondaryHover.backgroundColor, // active pagination button hover
                    borderColor: colors.secondaryHover.textColor,
                    color: colors.secondaryHover.textColor,
                },
                "&&&&&& button[data-disabled]": {
                    backgroundColor: colors.primaryDisabled.backgroundColor, // disabled pagination button (for the arrows)
                    borderColor: "transparent",
                },
            },
        });
    },
);




type ModsTableSortStatus = {
    columnAccessor: keyof ModWithInfo; //narrow from "typeof string"
} & DataTableSortStatus;


type ModsTableProps = {
    qualities: Quality[];
    difficulties: Difficulty[];
    techs: Tech[];
    modsWithInfo: ModWithInfo[];
    isLoading: boolean;
};




// We create a seperate ModsTable component to prevent the Mods queries
// running again when the ModsTable state changes.
export const ModsTable = ({ qualities, difficulties, modsWithInfo, isLoading }: ModsTableProps) => {
    const [currentTabIndex, setCurrentTabIndex] = useState<number | null>(null);    //track the currently selected parent difficulty


    const qualityNames = useMemo(   //get quality names for filter component
        () => [...qualities]
            .sort((a, b) => b.order - a.order)  //better qualities have higher orders, so we want them to sort first
            .map((quality) => quality.name)
            .slice(0, -1),  //remove "Not Recommended" from the selectable list, as no mods will ever publicly show as "Not Recommended"
        [qualities],
    );


    const parentDifficultyNames = useMemo(  //get parent difficulty names for filter component
        () => difficulties
            .filter((difficulty) => difficulty.parentDifficultyId === 0)    //parent difficulties all have the nullParent difficulty, with id = 0, as their parent
            .sort((a, b) => a.order - b.order)  //easier difficulties have lower orders, and we want them to sort first
            .map((difficulty) => difficulty.name),
        [difficulties],
    );

    const childDifficultyNames = useMemo(  //get child difficulty names for filter component
        () => {
            if (currentTabIndex === null) {
                return [];
            }

            const parentDifficultyName = parentDifficultyNames[currentTabIndex];
            if (parentDifficultyName === undefined) throw `Tab index ${currentTabIndex} is outside the range of ${parentDifficultyNames.length} tabs.`;

            const childDifficulties = difficulties
                .filter((difficulty) => difficulty.parentDifficultyId !== 0 && difficulty.name.startsWith(parentDifficultyName))
                .sort((a, b) => a.order - b.order)  //easier difficulties have lower orders, and we want them to sort first
                .map((difficulty) => {
                    const childDifficulty = difficulty.name.split(' ')[1];

                    if (childDifficulty === undefined) throw `${difficulty.name} is not of the form '<parentDifficulty>: <childDifficulty>'.`;

                    return childDifficulty;
                });

            const hasNoRating = modsWithInfo.some(mod => {
                if (mod.Difficulty.name !== noRatingsFoundMessage) {
                    return false;
                }

                const lowestCannonicalDifficulty = mod.lowestCannonicalDifficulty;
                if (lowestCannonicalDifficulty === undefined) throw `Mod ${mod.id} has no difficulty/lowestCannonicalDifficulty.`;

                const difficulty = difficulties.find(difficulty => difficulty.id === lowestCannonicalDifficulty);
                if (!difficulty) throw `Difficulty ${lowestCannonicalDifficulty} doesn't exist.`;

                return difficulty.name.startsWith(parentDifficultyName);
            });

            if (hasNoRating) {
                return [...childDifficulties, noRatingsFoundMessage];
            } else {
                return childDifficulties;
            }
        },
        [difficulties, modsWithInfo, parentDifficultyNames, currentTabIndex],
    );




    //handle filtering
    const [nameQuery, setNameQuery] = useState<string>("");
    const [debouncedNameQuery, _cancelDebouncedNameQueryChange] = useDebouncedValue(nameQuery, QUERY_DEBOUNCE_TIME_MILLISECONDS);
    const isNameFiltered = nameQuery !== "";

    
    const [selectedModTypes, setSelectedModTypes] = useState<ModType[]>([]);
    const isModTypeFiltered = selectedModTypes.length > 0;


    const [publisherQuery, setPublisherQuery] = useState<PrismaPublisher["name"]>("");
    const [debouncedPublisherQuery, _cancelDebouncedPublisherQueryChange] = useDebouncedValue(publisherQuery, QUERY_DEBOUNCE_TIME_MILLISECONDS);
    const isPublishersFiltered = publisherQuery !== "";


    type PublicationDate = Mod["timeCreatedGamebanana"];
    /** [min, max] */
    type PublicationDateRange = [PublicationDate | undefined, PublicationDate | undefined];

    const [publicationDateRange, setPublicationDateRange] = useState<PublicationDateRange>([undefined, undefined]);   // [min, max]
    const isPublicationDateFiltered = publicationDateRange[0] !== undefined || publicationDateRange[1] !== undefined;


    const [selectedTechsAny, setSelectedTechsAny] = useState<Tech["id"][]>([]);
    const isTechsAnyFiltered = selectedTechsAny.length > 0;


    const [selectedTechsFC, setSelectedTechsFC] = useState<Tech["id"][]>([]);
    const isTechsFCFiltered = selectedTechsFC.length > 0;


    const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
    const isQualityFiltered = selectedQualities.length > 0;


    const [qualityRatingsCountRange, setQualityRatingsCountRange] = useState<[number | undefined, number | undefined]>([undefined, undefined]);   // [min, max]
    const isQualityRatingsCountFiltered = qualityRatingsCountRange[0] !== undefined || qualityRatingsCountRange[1] !== undefined;


    const [selectedChildDifficulties, setSelectedChildDifficulties] = useState<string[]>([]);
    const isChildDifficultiesFiltered = selectedChildDifficulties.length > 0;


    const [difficultyRatingsCountRange, setDifficultyRatingsCountRange] = useState<[number | undefined, number | undefined]>([undefined, undefined]);   // [min, max]
    const isDifficultyRatingsCountFiltered = difficultyRatingsCountRange[0] !== undefined || difficultyRatingsCountRange[1] !== undefined;


    const [mapCountRange, setMapCountRange] = useState<[number | undefined, number | undefined]>([undefined, undefined]);     // [min, max]
    const isMapCountFiltered = mapCountRange[0] !== undefined || mapCountRange[1] !== undefined;


    // Reset tab index if the difficulties change.
    useEffect(() => {
        setCurrentTabIndex(parentDifficultyNames.length > 0 ? 0 : null);
    }, [difficulties, parentDifficultyNames]);


    // Check selected child difficulties when childDifficultyNames changes.
    useEffect(() => {
        const newSelectedChildDifficulties = selectedChildDifficulties.filter(childDifficulty => childDifficultyNames.includes(childDifficulty));
        // Only set when the list actually reduces.
        if (newSelectedChildDifficulties.length !== selectedChildDifficulties.length) {
            setSelectedChildDifficulties(newSelectedChildDifficulties);
        }
    }, [selectedChildDifficulties, childDifficultyNames]);


    const filteredModsWithInfo = useMemo(() => {
        return modsWithInfo.filter((modWithInfo) => {
            if (
                debouncedNameQuery &&
                !modWithInfo.name.toLowerCase().includes(debouncedNameQuery.trim().toLowerCase())
            ) {
                return false;
            }


            if (
                selectedModTypes.length &&
                !selectedModTypes.includes(modWithInfo.type)
            ) {
                return false;
            }


            if (
                debouncedPublisherQuery &&
                !modWithInfo.Publisher.name.toLowerCase().includes(debouncedPublisherQuery.trim().toLowerCase())
            ) {
                return false;
            }


            if (
                publicationDateRange[0] !== undefined ||
                publicationDateRange[1] !== undefined
            ) {
                if (
                    publicationDateRange[0] !== undefined &&
                    modWithInfo.timeCreatedGamebanana < publicationDateRange[0]
                ) {
                    return false;
                }

                if (
                    publicationDateRange[1] !== undefined &&
                    modWithInfo.timeCreatedGamebanana > publicationDateRange[1]
                ) {
                    return false;
                }
            }


            if (
                selectedTechsAny.length &&
                !selectedTechsAny.some(techId => modWithInfo.TechsAny.includes(techId))
            ) {
                return false;
            }


            if (
                selectedTechsFC.length &&
                !selectedTechsFC.some(techId => modWithInfo.TechsFC.includes(techId))
            ) {
                return false;
            }


            if (
                selectedQualities.length &&
                !selectedQualities.includes(modWithInfo.Quality.name)
            ) {
                return false;
            }


            if (
                qualityRatingsCountRange[0] !== undefined ||
                qualityRatingsCountRange[1] !== undefined
            ) {
                if (
                    qualityRatingsCountRange[0] !== undefined &&
                    modWithInfo.Quality.count < qualityRatingsCountRange[0]
                ) {
                    return false;
                }

                if (
                    qualityRatingsCountRange[1] !== undefined &&
                    modWithInfo.Quality.count > qualityRatingsCountRange[1]
                ) {
                    return false;
                }
            }


            if (currentTabIndex !== null) {
                // Check parent difficulty
                const parentDifficultyName = parentDifficultyNames[currentTabIndex];
                if (parentDifficultyName === undefined) throw `Tab index ${currentTabIndex} is outside the range of the ${parentDifficultyNames.length} tabs.`;

                if (modWithInfo.Difficulty.name === noRatingsFoundMessage) {
                    // Mod doesn't have a difficulty rating, so we check if the lowestCannonicalDifficulty is a child of parentDifficulty.
                    const lowestCannonicalDifficulty = modWithInfo.lowestCannonicalDifficulty;
                    if (lowestCannonicalDifficulty === undefined) throw `Mod ${modWithInfo.id} has no difficulty/lowestCannonicalDifficulty.`;

                    const difficulty = difficulties.find(difficulty => difficulty.id === lowestCannonicalDifficulty);
                    if (!difficulty) throw `Difficulty ${lowestCannonicalDifficulty} doesn't exist.`;

                    if (!difficulty.name.startsWith(parentDifficultyName)) {
                        return false;
                    }
                }
                // Mod has a difficulty rating, so we check if its difficulty is a child of parentDifficulty.
                else if (!modWithInfo.Difficulty.name.startsWith(parentDifficultyName)) {
                    return false;
                }
            }

            
            if (
                selectedChildDifficulties.length &&
                !selectedChildDifficulties.some(childDifficulty => modWithInfo.Difficulty.name.endsWith(childDifficulty))
            ) {
                return false;
            }


            if (
                difficultyRatingsCountRange[0] !== undefined ||
                difficultyRatingsCountRange[1] !== undefined
            ) {
                if (
                    difficultyRatingsCountRange[0] !== undefined &&
                    modWithInfo.Difficulty.count < difficultyRatingsCountRange[0]
                ) {
                    return false;
                }

                if (
                    difficultyRatingsCountRange[1] !== undefined &&
                    modWithInfo.Difficulty.count > difficultyRatingsCountRange[1]
                ) {
                    return false;
                }
            }


            if (
                mapCountRange[0] !== undefined ||
                mapCountRange[1] !== undefined
            ) {
                if (
                    mapCountRange[0] !== undefined &&
                    modWithInfo.Map.length < mapCountRange[0]
                ) {
                    return false;
                }

                if (
                    mapCountRange[1] !== undefined &&
                    modWithInfo.Map.length > mapCountRange[1]
                ) {
                    return false;
                }
            }


            return true;
        });
    }, [debouncedNameQuery, selectedModTypes, debouncedPublisherQuery, publicationDateRange, selectedTechsAny, selectedTechsFC, selectedQualities, qualityRatingsCountRange, selectedChildDifficulties, difficultyRatingsCountRange, mapCountRange, currentTabIndex, parentDifficultyNames, difficulties, modsWithInfo]);


    // TODO!!!: continue down from here to implement new columns (do everything except for actually render the tooltips for now). also, pass the maps and techs to the expanded mod component so we aren't double fetching.


    //handle sorting
    const [sortStatus, setSortStatus] = useState<ModsTableSortStatus>({
        columnAccessor: "name",
        direction: "asc",
    });

    const sortedModsWithInfo = useMemo(() => {
        const columnAccessor = sortStatus.columnAccessor;

        const sortedModsWithInfo = [...filteredModsWithInfo];

        if (columnAccessor === "Map") {
            sortedModsWithInfo.sort(
                (a, b) => {
                    const propertyANum = Number(a.Map.length);
                    const propertyBNum = Number(b.Map.length);

                    const aIsNan = isNaN(propertyANum);
                    const bIsNan = isNaN(propertyBNum);

                    if (aIsNan && bIsNan) return 0;
                    if (aIsNan) return -1;
                    if (bIsNan) return 1;

                    return (
                        sortStatus.direction === "asc" ?
                            propertyANum - propertyBNum :
                            propertyBNum - propertyANum
                    );
                },
            );
        } else if (columnAccessor === "Quality") {
            sortedModsWithInfo.sort(
                (a, b) => {
                    if (a === b) return 0;

                    const aQuality = qualities.find((quality) => quality.name === a.Quality.name);
                    const bQuality = qualities.find((quality) => quality.name === b.Quality.name);

                    if (!aQuality && !bQuality) return 0;
                    if (!aQuality) return 1;
                    if (!bQuality) return -1;

                    return (
                        sortStatus.direction === "asc" ?
                            bQuality.order - aQuality.order :   //b-a because better qualities have higher orders, but we want them to sort first when ascending
                            aQuality.order - bQuality.order
                    );
                },
            );
        } else if (columnAccessor === "Difficulty") {
            sortedModsWithInfo.sort(
                (a, b) => {
                    if (a === b) return 0;

                    const aDifficulty = difficulties.find((difficulty) => difficulty.name === a.Difficulty.name);
                    const bDifficulty = difficulties.find((difficulty) => difficulty.name === b.Difficulty.name);

                    if (!aDifficulty && !bDifficulty) return 0;
                    if (!aDifficulty) return 1;
                    if (!bDifficulty) return -1;

                    return (
                        sortStatus.direction === "asc" ?
                            aDifficulty.order - bDifficulty.order :
                            bDifficulty.order - aDifficulty.order
                    );
                },
            );
        } else {
            sortedModsWithInfo.sort(
                (a, b) => {
                    const propertyAString = String(a[columnAccessor]);
                    const propertyBString = String(b[columnAccessor]);

                    return (
                        sortStatus.direction === "asc" ?
                            propertyAString.localeCompare(propertyBString) :
                            propertyBString.localeCompare(propertyAString)
                    );
                },
            );
        }

        return sortedModsWithInfo;
    }, [filteredModsWithInfo, sortStatus, qualities, difficulties]);




    //handle row expansion
    const [expandedRowIds, setExpandedRowsIds] = useState<number[]>([]);
    const sortedModsWithIsExpanded = useMemo(() => {
        const modsWithExpansion = sortedModsWithInfo.map(
            (mod) => {
                return ({
                    ...mod,
                    isExpanded: expandedRowIds.some(
                        (id) => id === mod.id,
                    ),
                });
            },
        );

        return modsWithExpansion;
    }, [sortedModsWithInfo, expandedRowIds]);




    //handle pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[DEFAULT_PAGE_SIZE_INDEX] ?? 10);

    //reset page when required
    useEffect(() => {
        setPage(1);
    }, [sortStatus, pageSize, debouncedNameQuery, mapCountRange, selectedModTypes, selectedQualities, selectedChildDifficulties, currentTabIndex]);

    //handle providing datatable with correct subset of data
    // const [records, setRecords] = useState<ModWithInfo[]>(sortedModsWithIsExpanded.slice(0, pageSize));
    const records = useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const newRecords = sortedModsWithIsExpanded.slice(startIndex, endIndex);

        return newRecords;
    }, [page, pageSize, sortedModsWithIsExpanded]);




    //reset expanded rows when sortStatus, page, or page size changes
    useEffect(() => {
        // If expandedRowIds is already empty, we return it instead of a new array
        // to prevent the sortedModsWithIsExpanded memo function from running again.
        setExpandedRowsIds(expandedRowIds => expandedRowIds.length === 0 ? expandedRowIds : []);
    }, [sortStatus, page, pageSize]);




    // apply the correct class to the body element to change the background color of the pagination dropdown
    useEffect(() => {
        const menuClassNames = canonicalDifficultyNames.map((difficultyName) => `${difficultyName.toLowerCase()}-menu`);


        if (currentTabIndex !== null) {
            const body = document.querySelector('body');

            if (body === null) return;  // body is null in SSR


            const validTabIndex = currentTabIndex > greatestValidDifficultyIndex ? greatestValidDifficultyIndex : currentTabIndex;


            const menuClassName = menuClassNames[validTabIndex];

            if (!menuClassName) {
                throw "menuClassName is undefined";
            }


            body.classList.add(menuClassName);


            return () => {
                body.classList.remove(menuClassName);
            };
        }
    }, [currentTabIndex]);


    const colors = colorsForDifficultyIndex(currentTabIndex);

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


    return (
        <>
            <div className={classes.tabContainer}>
                {
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
                    )
                }
            </div>
            <DataTable
                classNames={{
                    root: classes.table,
                    header: classes.header,
                    pagination: classes.pagination,
                }}
                defaultColumnProps={{
                    cellsClassName: (record) => {
                        return cx(
                            classes.modCell,
                            record.isExpanded && classes.expandedModCell,
                        );
                    },
                }}
                height={550}
                striped
                textSelectionDisabled
                withColumnBorders
                highlightOnHover
                fetching={isLoading}
                records={records}
                idAccessor={(record) => record.id}
                columns={[
                    {
                        accessor: "name",
                        title: "Name",
                        sortable: true,
                        filter: (
                            <StringSearch
                                value={nameQuery}
                                setValue={setNameQuery}
                                label="Name"
                                description="Show mods whose names include the specified text"
                                placeholder="Search names..."
                                difficultyIndex={currentTabIndex}
                                iconProps={{ color: colors.primary.textColor }}
                            />
                        ),
                        filtering: isNameFiltered,
                        titleClassName: isNameFiltered ? classes.filteredColumnTitle : classes.unfilteredColumnTitle,
                        cellsClassName: (record) => {
                            return cx(
                                classes.modCell,
                                classes.leftColumnCell,
                                record.isExpanded && classes.expandedModCell,
                            );
                        },
                    },
                    {
                        accessor: "Quality",
                        title: "Quality",
                        sortable: true,
                        render: (modWithInfo) => modWithInfo.Quality.name,
                        filter: (
                            <ListSelect
                                permittedStrings={qualityNames}
                                selectedStrings={selectedQualities}
                                setSelectedStrings={setSelectedQualities}
                                difficultyIndex={currentTabIndex}
                            />
                        ),
                        filtering: isQualityFiltered,
                        titleClassName: isQualityFiltered ? classes.filteredColumnTitle : classes.unfilteredColumnTitle
                    },
                    {
                        accessor: "Difficulty",
                        title: "Difficulty",
                        sortable: true,
                        render: (modWithInfo) => modWithInfo.Difficulty.name,
                        filter: (
                            <ListSelect
                                permittedStrings={childDifficultyNames}
                                selectedStrings={selectedChildDifficulties}
                                setSelectedStrings={setSelectedChildDifficulties}
                                difficultyIndex={currentTabIndex}
                            />
                        ),
                        filtering: isChildDifficultiesFiltered,
                        titleClassName: isChildDifficultiesFiltered ? classes.filteredColumnTitle : classes.unfilteredColumnTitle,
                        cellsClassName: (record) => {
                            return cx(
                                classes.modCell,
                                classes.rightColumnCell,
                                record.isExpanded && classes.expandedModCell,
                            );
                        },
                    },
                    {
                        accessor: "Map",
                        title: "# Maps",
                        sortable: true,
                        render: (modWithInfo) => modWithInfo.Map.length,
                        filter: (
                            <NumberSearch
                                range={mapCountRange}
                                setRange={setMapCountRange}
                                maxProps={{
                                    label: "Map Count",
                                    description: "Maximum",
                                    placeholder: "Set maximum..."
                                }}
                                minProps={{
                                    description: "Minimum",
                                    placeholder: "Set minimum..."
                                }}
                                difficultyIndex={currentTabIndex}
                            />
                        ),
                        filtering: isMapCountFiltered,
                        titleClassName: isMapCountFiltered ? classes.filteredColumnTitle : classes.unfilteredColumnTitle,
                    },
                    // {
                    //     accessor: "type",
                    //     title: "Type",
                    //     sortable: true,
                    //     filter: (
                    //         <ListSelect
                    //             permittedStrings={getNonEmptyArray(modTypes)}
                    //             selectedStrings={selectedModTypes}
                    //             setSelectedStrings={setSelectedModTypes}
                    //             difficultyIndex={currentTabIndex}
                    //         />
                    //     ),
                    //     filtering: isModTypeFiltered,
                    //     titleClassName: isModTypeFiltered ? classes.filteredColumnTitle : classes.unfilteredColumnTitle
                    // },
                ]}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus as Dispatch<SetStateAction<DataTableSortStatus>>}     //un-narrow type to match types in DataTable
                rowExpansion={{
                    trigger: "click",
                    allowMultiple: false,
                    expanded: {
                        recordIds: expandedRowIds,
                        onRecordIdsChange: setExpandedRowsIds,
                    },
                    content: ({ record }) => {
                        return (
                            <ExpandedMod
                                isLoading={isLoading}
                                mod={record}
                                colors={colors}
                            />
                        );
                    }
                }}
                totalRecords={sortedModsWithIsExpanded.length}
                recordsPerPage={pageSize}
                page={page}
                onPageChange={setPage}
                recordsPerPageOptions={PAGE_SIZES}
                onRecordsPerPageChange={setPageSize}
            />
        </>
    );
};