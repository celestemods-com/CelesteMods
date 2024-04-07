
import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { Group, Popover, Text, createStyles } from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useGamebananaModDownloadUrl } from "~/hooks/gamebananaApi";
import { FAQ_PAGE_PATHNAME } from "~/consts/pathnames";
import { OLYMPUS_INSTALLATION_URL } from "~/consts/olympusInstallationUrl";
import { type DifficultyColor } from "~/styles/difficultyColors";
import { colorsForDifficultyIndex } from "~/styles/modsColors";
import { currentDifficultyTabIndexContext } from "../modsTable";




type ModDownloadButtonProps = {
    gamebananaModId: number;
};




const useStyles = createStyles(
    (
        theme,
        {
            colors,
            isOpened,
        }: {
            colors: DifficultyColor;
            isOpened: boolean;
        }
    ) => {
        return ({
            downloadButton: {
                backgroundColor: isOpened ? colors.primaryHover.backgroundColor : colors.primary.backgroundColor,
                color: isOpened ? colors.primaryHover.textColor : colors.primary.textColor,
                /* left/right top/bottom */
                padding: "2px 10px",
                borderRadius: "8px",
            },
            dropdown: {
                '&&': {
                    backgroundColor: theme.white,
                    padding: "5px 10px",
                },
                "a": {
                    textDecoration: "underline",
                },
            },
            dropdownText: {
                margin: "5px 0",
            },
            arrow: {
                backgroundColor: theme.white,
                border: "none",
                pointerEvents: "none",
            }
        });
    }
);




export const ModDownloadButton = ({ gamebananaModId }: ModDownloadButtonProps) => {
    const { downloadUrl } = useGamebananaModDownloadUrl({ gamebananaModId });

    const [isOpened, { close, open }] = useDisclosure(false);

    // Since there is a gap between the link and the popover,
    // debouncing prevents the popover from closing when we move from the link to popover.
    const [debouncedIsOpened] = useDebouncedValue(isOpened, 110);


    const currentTabIndex = useContext(currentDifficultyTabIndexContext);


    const colors = colorsForDifficultyIndex(currentTabIndex);

    const { classes } = useStyles({ colors, isOpened });


    return (
        <Popover position="bottom"
            withArrow
            shadow="md"
            opened={debouncedIsOpened}
            classNames={{ dropdown: classes.dropdown, arrow: classes.arrow }}>
            <Popover.Target>
                <a
                    href={downloadUrl}
                    onMouseEnter={open}
                    onMouseLeave={close}
                    className={classes.downloadButton}
                >
                    <Group
                        spacing={"5px"}
                    >
                        <Image
                            src={"/images/everest-logo/everest-logo.png"}
                            alt={"Everest modding API logo"}
                            width={16}
                            height={16}
                        />
                        <Text size={"md"}>
                            1-Click Install
                        </Text>
                    </Group>
                </a>
            </Popover.Target>
            <Popover.Dropdown
                onMouseEnter={open}
                onMouseLeave={close}>
                <Text className={classes.dropdownText}>
                    Install the mod directly using <Link href={OLYMPUS_INSTALLATION_URL} target="_blank" rel="noopener noreferrer">Olympus</Link>, a mod manager for Celeste.
                </Text>
                <Text className={classes.dropdownText}>
                    You can also use one of the <Link href={`${FAQ_PAGE_PATHNAME}#mod_managers`} target="_blank">other methods</Link>.
                </Text>
            </Popover.Dropdown>
        </Popover>
    );
};