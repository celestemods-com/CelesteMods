import { Carousel } from "@mantine/carousel";
import { useModImageUrls } from "~/hooks/globalContexts/modImageUrls/useModImageUrls";
import type { ModImageUrls } from "~/hooks/globalContexts/modImageUrls/constsAndTypes";
import { createStyles } from "@mantine/core";
import { Image } from "@mantine/core";      //TODO!: replace with nextjs Image component once next.config.mjs is fixed
// import Image from "next/image";
import type { DifficultyColor } from "~/styles/difficultyColors";




const useStyles = createStyles(
    (
        _theme,
        { colors }: { colors: DifficultyColor; },
    ) => ({
        carousel: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                width: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: "10px",
                /** top | left and right | bottom */
                padding: "21px 20px 20px",
            },
        },
        viewport: {
            "div": {
                alignItems: 'center',
            }
        },
        slide: {
            width: "400px",
        },
        imgMaxHeight250: {
            "img": {
                maxHeight: "250px",
            }
        },
        imgMaxHeight400: {
            "img": {
                maxHeight: "400px",
            }
        },
        controls: {
            transform: "translate(0, 0)",
            position: "unset"
        },
        control: {
            backgroundColor: colors.primary.backgroundColor,
            color: colors.primary.textColor,
            opacity: "0.9"
        },
    }),
);




type modCarouselProps = {
    gamebananaModId: number,
    screenshotsFromModSearchDatabase: ModImageUrls | undefined,
    numberOfMaps: number,
    colors: DifficultyColor,
};




export const ModCarousel = ({ gamebananaModId, screenshotsFromModSearchDatabase, numberOfMaps, colors }: modCarouselProps) => {
    const imageUrls = useModImageUrls({ gamebananaModId, screenshotsFromModSearchDatabase });


    const { cx, classes } = useStyles({ colors });


    return (
        <Carousel classNames={{
            root: classes.carousel,
            viewport: classes.viewport,
            slide: cx(classes.slide, numberOfMaps >= 4 ? classes.imgMaxHeight400 : classes.imgMaxHeight250),
            controls: classes.controls,
            control: classes.control,
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
                    />
                </Carousel.Slide>
            ))}
        </Carousel>
    );
};