import { Loader, LoadingOverlay, createStyles } from "@mantine/core";
import { Mod } from "~/components/mods/types";
import { api } from "~/utils/api";




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
    const isExpanded = mod.isExpanded;
    const mapsCount = mod.Map.length;


    const { cx, classes } = useStyles();

    if (isLoading) return <Loader />;

    return (
        <>

        </>
    );
};


export default ExpandedMod;