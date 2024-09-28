import { createStyles, Flex, ScrollArea } from "@mantine/core";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Layout } from "~/components/layout/layout";
import { CLAIM_USER_PATHNAME, MODS_PAGE_PATHNAME } from "~/consts/pathnames";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";




const LEGO_CELESTE_IMAGE_URL = "https://ideascdn.lego.com/media/generate/lego_ci/b31418aa-0482-4a00-b66a-258807f3ea96/resize:950:633/webp";




const useStyles = createStyles(
  (theme) => ({
    scrollArea: {
      height: `${pageContentHeightPixels}px`,
      "h2": {
        margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
      },
      "h3": {
        margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
      },
      "h4": {
        margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
      },
      "h5": {
        margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
      },
      "p": {
        margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
      },
      "img": {
        margin: `0 ${theme.spacing.sm} ${theme.spacing.xs}`,
      },
    },
    innerFlex: {
      flex: 1,
    },
    link: {
      textDecoration: "underline",
    },
  }),
);




type ClaimUserLinkProps = {
  isAuthenticated: boolean;
  classes: ReturnType<typeof useStyles>["classes"];
};


const ClaimUserLink = ({
  isAuthenticated,
  classes,
}: ClaimUserLinkProps) => {
  const linkText = "CLAIM YOUR OLD USER";


  if (isAuthenticated) {
    return <Link className={classes.link} href={CLAIM_USER_PATHNAME}>{linkText}</Link>;
  }


  return <a className={classes.link} onClick={() => signIn("discord", { callbackUrl: CLAIM_USER_PATHNAME })}>{linkText}</a>;
};




const Home: NextPage = () => {
  const { classes } = useStyles();
  const height = 280;
  const width = height / 577 * 867;


  const { status } = useSession();
  const isAuthenticated = status === "authenticated";


  return (
    <Layout
      pageTitle="Home"
      pageDescription="Home"
      pathname="/"
    >
      <ScrollArea
        offsetScrollbars
        className={classes.scrollArea}
      >
        <Flex
          direction="row"
          wrap="nowrap"
          justify="space-between"
        >
          <Flex
            className={classes.innerFlex}
            direction="column"
            wrap="wrap"
          >
            <h2>CML Public Beta</h2>
            <p>Welcome! The site is currently in early beta.</p>
            <p>For now, <Link className={classes.link} href={MODS_PAGE_PATHNAME}>mods</Link> can only be browsed.</p>
            <p>
              If you submitted ratings via the google form, <strong>PLEASE <ClaimUserLink isAuthenticated={isAuthenticated} classes={classes} /></strong> instead of submitting duplicate ratings for the same maps!
            </p>
            <h2>Community Projects</h2>
            <h3 style={{ marginTop: "2px" }}>Celeste Mountain Lego Idea</h3>
            <Image
              src={LEGO_CELESTE_IMAGE_URL}
              alt="A render of the proposed Celeste Mountain Lego set."
              height={height}
              width={width}
            />
            <p>
              A lego set for Celeste. If you want this to exist, vote for it <Link className={classes.link} href="https://ideas.lego.com/projects/ac89cbf0-9d0b-401d-b8cb-5316056d498f">here</Link>.
            </p>
          </Flex>
        </Flex>
      </ScrollArea>
    </Layout >
  );
};

export default Home;