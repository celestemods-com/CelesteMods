import { Text } from "@mantine/core";




type PublicationDateProps = {
    publicationDate: Date | undefined;
};




const PUBLICATION_DATE_LABEL = "Published: ";




const PublicationDate = ({ publicationDate }: PublicationDateProps) => {
    return (
        <Text size="md">
            {PUBLICATION_DATE_LABEL + publicationDate === undefined ? "Undefined" : publicationDate?.toLocaleDateString()}
        </Text>
    );
};


export default PublicationDate;