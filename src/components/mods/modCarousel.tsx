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
                width: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: "10px",
                padding: "20px",
            },
        },
        viewport: {
            border: "3px solid #263972",
        },
        slide: {
            width: "400px",
        },
        controls: {
            transform: "translate(0, 0)",
            position: "unset"
        },
        control: {
            backgroundColor: "#263972",
            color: "white",
            opacity: "0.9"
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
            <Carousel classNames={{
                root: classes.carousel,
                viewport: classes.viewport,
                slide: classes.slide,
                controls: classes.controls,
                control:classes.control,
            }}>
                {imageUrls.map((imageUrl) => (
                    <Carousel.Slide
                        key={imageUrl}
                        gap={"md"}
                        size={"400px"}
                    >
                        <Image
                            src={imageUrl}
                            alt="Mod image"
                            width={400}
                            height={300}     //TODO!!: add responsive image sizes
                        />
                    </Carousel.Slide>
                ))}
            </Carousel>
        )
    );
};


export default ModCarousel;