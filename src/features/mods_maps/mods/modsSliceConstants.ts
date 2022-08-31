export const modTableColumnCssNames = ["mod-name", "map-count", "mod-type", "quality", "community-difficulty", "tech", "cml-difficulty", "reviews"] as const;

export const modTableColumnNames = [
    {
        headerName: "Mod Name",
        cssName: modTableColumnCssNames[0],
    },
    {
        headerName: "# of Maps",
        cssName: modTableColumnCssNames[1],
    },
    {
        headerName: "Type",
        cssName: modTableColumnCssNames[2],
    },
    {
        name: "Community Rating",
        entries: [
            {
                headerName: "Quality",
                cssName: modTableColumnCssNames[3],
            },
            {
                headerName: "Difficulty",
                cssName: modTableColumnCssNames[4],
            },
        ],
    },
    {
        headerName: "Tech",
        cssName: modTableColumnCssNames[5],
    },
    {
        headerName: "CML Difficulty",
        cssName: modTableColumnCssNames[6],
    },
    {
        headerName: "Reviews",
        cssName: modTableColumnCssNames[7],
    },
] as const;