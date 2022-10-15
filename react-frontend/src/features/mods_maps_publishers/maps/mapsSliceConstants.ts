export const mapsSubTableColumnNames = [
    {
        jsName: "name",
        headerName: "Map Name",
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
        jsName: "length",
        headerName: "Length",
    },
    {
        jsName: "tech",
        headerName: "Tech",
    },
] as const;