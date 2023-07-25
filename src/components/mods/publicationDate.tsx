import { Group, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import useFetch from "react-fetch-hook";
import { GamebananaResponse, getGamebananaUrl } from "~/utils/gamebananaApiHelpers";




type PublicationDateProps = {
    gamebananaModId: number;
};




const PUBLICATION_DATE_LABEL = "Published: ";




const PublicationDate = ({ gamebananaModId }: PublicationDateProps) => {
    const queryUrl = getGamebananaUrl({
        itemType: "Mod",
        itemId: gamebananaModId,
        fields: "date",
    });


    //get publication date
    const [publicationDate, setPublicationDate] = useState<Date>(new Date(0));

    const publicationDateQuery = useFetch<GamebananaResponse>(queryUrl, { depends: [gamebananaModId] });


    useEffect(() => {
        const queryData = publicationDateQuery.data;


        if (queryData && Array.isArray(queryData) && queryData.length === 1) {
            const time = Number(queryData);

            if (isNaN(time)) return;


            setPublicationDate(new Date(time));
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