import { Group, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import useFetch from "react-fetch-hook";
import { GamebananaApiResponse, useGamebananaApiUrl } from "~/hooks/gamebananaApi";




type PublicationDateProps = {
    gamebananaModId: number;
};




const PUBLICATION_DATE_LABEL = "Published: ";




const PublicationDate = ({ gamebananaModId }: PublicationDateProps) => {
    const queryUrl = useGamebananaApiUrl({
        itemType: "Mod",
        itemId: gamebananaModId,
        fields: "date",
    });


    //get publication date
    const [publicationDate, setPublicationDate] = useState<Date>(new Date(0));

    const publicationDateQuery = useFetch<GamebananaApiResponse<false>>(queryUrl, { depends: [gamebananaModId] });    //TODO!: implement caching


    useEffect(() => {
        const queryData = publicationDateQuery.data;


        if (queryData && Array.isArray(queryData) && queryData.length === 1) {
            const seconds = Number(queryData);

            if (isNaN(seconds)) return;


            setPublicationDate(new Date(seconds * 1000));
        }
    }, [publicationDateQuery.data]);


    if (publicationDateQuery.isLoading) return (
        <Group position="center">
            <Text>
                {PUBLICATION_DATE_LABEL}
            </Text>
            <Loader
                size="sm"
            />
        </Group>
    );


    return (
        <Text>
            {PUBLICATION_DATE_LABEL + publicationDate.toLocaleDateString()}
        </Text>
    );
};


export default PublicationDate;