import { useContext, forwardRef } from "react";
import Link from "next/link";
import { createStyles } from "@mantine/core";
import type { DifficultyColor } from "~/styles/difficultyColors";
import { colorsForDifficultyIndex } from "~/styles/modsColors";
import { currentDifficultyTabIndexContext } from "./mods/modsTable";




const useStyles = createStyles(
    (
        _theme,
        {
            colors,
        }: {
            colors: DifficultyColor;
        }
    ) => {
        return ({
            button: {
                backgroundColor: colors.primary.backgroundColor,
                color: colors.primary.textColor,
                /* left/right top/bottom */
                padding: "2px 10px",
                border: "none",
                borderRadius: "8px",
                "&:hover": {
                    backgroundColor: colors.primaryHover.backgroundColor,
                    color: colors.primaryHover.textColor,
                }
            },
        });
    }
);




type LinkButtonProps = {
    children: React.ReactNode;
    href: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    linkWrapper?: boolean;
};




export const LinkButton = forwardRef<
    HTMLAnchorElement,
    LinkButtonProps
>(
    (
        {
            children,
            href,
            onMouseEnter,
            onMouseLeave,
            linkWrapper = true,
        },
        ref,
    ) => {
        const currentTabIndex = useContext(currentDifficultyTabIndexContext);

        const colors = colorsForDifficultyIndex(currentTabIndex ?? 0);  // default to beginner colors if no context is provided. null would give the highest valid difficulty's color.

        const { classes } = useStyles({ colors });


        return (
            linkWrapper ? (
                <Link
                    href={href}
                    ref={ref}
                    type="button"
                    className={classes.button}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {children}
                </Link>
            ) : (
                <a
                    href={href}
                    ref={ref}
                    type="button"
                    className={classes.button}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {children}
                </a>
            )
        );
    }
);