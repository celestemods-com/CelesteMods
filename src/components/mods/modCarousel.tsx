import { Carousel } from "@mantine/carousel";
import { useGamebananaModImageUrls } from "~/hooks/gamebananaApi";
import { createStyles } from "@mantine/core";
import { Image } from "@mantine/core";      //TODO!: replace with nextjs Image component once next.config.mjs is fixed
// import Image from "next/image";
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
    gamebananaModId: number,
};




const ModCarousel = ({ gamebananaModId }: modCarouselProps) => {
    const { imageUrls } = useGamebananaModImageUrls({ gamebananaModId });


    const { cx, classes } = useStyles();


    return (
        !imageUrls ? (
            null
        ) : (
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
                            height={350}     //TODO!!: add responsive image sizes
                        />
                    </Carousel.Slide>
                ))}
            </Carousel>
        )
    );
};


export default ModCarousel;