import { Group, Loader, Stack, Text, createStyles } from "@mantine/core";
import { Mod } from "~/components/mods/types";
import { api } from "~/utils/api";
import MapsTable from "./mapsTable";
import { useMemo } from "react";
import PublisherName from "./publisherName";
import PublicationDate from "./publicationDate";
import ModDownloadButton from "./modDownloadButton/modDownloadButton";
import Link from "next/link";
import ModCarousel from "./modCarousel";




const useStyles = createStyles(
    (theme) => ({
        map: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                margin: `${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.xl}`
            },
        },
    }),
);




type ExpandedModProps = {
    isLoading: boolean,
    mod: Mod,
};




const ExpandedMod = ({ isLoading, mod }: ExpandedModProps) => {
    const isMapperNameVisiblePermitted = false;


    //TODO!!!: continue here
    //add publication date, 1-click download button (own component), "more info" button, and carousel
    //then implement /mods/[id] (also using mapsTable)


    const { cx, classes } = useStyles();

    if (isLoading) return <Loader />;

    return (
        <Stack justify="center" align="center">
            <Group position="center" align="center">
                <PublisherName publisherId={mod.publisherId} />
                <PublicationDate gamebananaModId={mod.gamebananaModId} />
                <ModDownloadButton gamebananaModId={mod.gamebananaModId} />
                <Link
                    href={{
                        pathname: "/mods/[id]",
                        query: { id: mod.id },
                    }}
                >
                    More Info
                </Link>
            </Group>
            <MapsTable
                isLoadingMod={isLoading}
                isNormalMod={mod.type === "Normal"}
                isMapperNameVisiblePermitted={isMapperNameVisiblePermitted}
                mapIds={mod.Map.map(({ id }) => id)}
            />
            <ModCarousel gamebananaModId={mod.gamebananaModId} />
        </Stack>
    );
};


export default ExpandedMod;