export const modTableColumnNames = [
    {
        jsName: "name",
        headerName: "Mod Name",
    },
    {
        jsName: "mapCount",
        headerName: "# of Maps",
    },
    {
        jsName: "type",
        headerName: "Type",
    },
    {
        jsName: "communityRatings",
        name: "Community Rating",
        entries: [
            {
                jsName: "quality",
                headerName: "Quality",
            },
            {
                jsName: "difficulty",
                headerName: "Difficulty",
            },
        ],
    },
    {
        jsName: "tech",
        headerName: "Tech",
    },
    {
        jsName: "cmlDifficulty",
        headerName: "CML Difficulty",
    },
    {
        jsName: "reviews",
        headerName: "Reviews",
    },
] as const;