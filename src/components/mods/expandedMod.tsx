import { Flex, Group, Loader, Stack, createStyles } from "@mantine/core";
import { Mod } from "~/components/mods/types";
import Maps from "./maps/maps";
import PublisherName from "./publisherName";
import PublicationDate from "./publicationDate";
import ModDownloadButton from "./modDownloadButton/modDownloadButton";
import Link from "next/link";
import ModCarousel from "./modCarousel";
import { COMING_SOON_PATHNAME } from "~/consts/pathnames";




const useStyles = createStyles(
    (theme) => ({
        map: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                margin: `${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.xl}`
            },
        },
        expandedMod: {
            backgroundColor: "#e1e1e2",
            color: "black",
            borderRadius: "0 0 50px 50px",
            // We move the expanded mod up to make
            // the mod row and expanded mod look like a single row.
            transform: "translate(0, -45px)",
        },
        moreInfo: {
            fontSize: "1rem",
        },
        modDetails: {
            padding: "10px 25px",
        }
    }),
);




type ExpandedModProps = {
    isLoading: boolean,
    mod: Mod,
};




const ExpandedMod = ({ isLoading, mod }: ExpandedModProps) => {
    const isMapperNameVisiblePermitted = false;


    const publicationDateInSeconds = mod.timeCreatedGamebanana;
    const publicationDate = publicationDateInSeconds > 0 ? new Date(publicationDateInSeconds * 1000) : undefined;


    const { classes } = useStyles();

    if (isLoading) return <Loader />;

    return (
        <Stack justify="center" align="stretch" className={classes.expandedMod} spacing="0">
            <Group position="apart" align="center" className={classes.modDetails}>
                <PublisherName publisherId={mod.publisherId} />
                <PublicationDate publicationDate={publicationDate} />
                <ModDownloadButton gamebananaModId={mod.gamebananaModId} />
                <Link
                    href={{
                        pathname: COMING_SOON_PATHNAME,
                    }}
                    className={classes.moreInfo}
                >
                    More Info
                </Link>
            </Group>
            <Flex align="center" justify="space-around">
                <Maps
                    isLoadingMod={isLoading}
                    isNormalMod={mod.type === "Normal"}
                    isMapperNameVisiblePermitted={isMapperNameVisiblePermitted}
                    mapIds={mod.Map.map(({ id }) => id)}
                />
                <ModCarousel gamebananaModId={mod.gamebananaModId} numberOfMaps={mod.Map.length}/>
            </Flex>
        </Stack>
    );
};

export default ExpandedMod;