import { Carousel } from "@mantine/carousel";
import { useGamebananaModImageUrls } from "~/hooks/gamebananaApi";
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

    
    const gamebananaModId = mod?.gamebananaModId;

    const imageUrls = useGamebananaModImageUrls({gamebananaModId});
};


export default ModCarousel;