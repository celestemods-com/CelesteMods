import { Carousel } from "@mantine/carousel";
import { api } from "~/utils/api";




type modCarouselProps = {
    modId: number,
};




const ModCarousel = ({ modId }: modCarouselProps) => {
    const modQuery = api.mod.getById.useQuery(
        { id: modId },
        { queryKey: ["mod.getById", { id: modId }] },
    );

    const mod = modQuery.data;


    const images = 
};


export default ModCarousel;