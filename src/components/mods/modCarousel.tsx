import { Carousel } from "@mantine/carousel";
import { useGamebananaModImageUrls } from "~/hooks/gamebananaApi";
import { Image, createStyles } from "@mantine/core";
import { api } from "~/utils/api";




const useStyles = createStyles(
    (_theme) => ({
        carousel: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                maxWidth: "550px",
            },
        },
    }),
);




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

    const imageUrls = useGamebananaModImageUrls({ gamebananaModId });


    const { cx, classes } = useStyles();


    return (
        <Carousel>
            {imageUrls.map((imageUrl) => (
                <Carousel.Slide
                    key={imageUrl}
                    gap={"md"}
                    size={"500px"}
                    className={classes.carousel}
                >
                    <Image
                        src={imageUrl}
                        alt="Mod image"
                    />
                </Carousel.Slide>
            ))}
        </Carousel>
    );
};


export default ModCarousel;