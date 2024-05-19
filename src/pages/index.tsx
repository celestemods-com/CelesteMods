import { createStyles } from "@mantine/core";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { Layout } from "~/components/layout/layout";
import { MODS_PAGE_PATHNAME } from "~/consts/pathnames";




const LEGO_CELESTE_IMAGE_URL = "https://ideascdn.lego.com/media/generate/lego_ci/b31418aa-0482-4a00-b66a-258807f3ea96/resize:950:633/webp";




const useStyles = createStyles(
  () => ({
    link: {
      textDecoration: "underline",
    },
  }),
);




const Home: NextPage = () => {
  const { classes } = useStyles();
  const height = 280;
  const width = height / 577 * 867;

  return (
    <Layout
      pageTitle="Home"
      pageDescription="Home"
      pathname="/"
    >
      <h1>Celeste Mods List</h1>
      <p>Welcome! The site is currently in early beta.</p>
      <Link
        href={MODS_PAGE_PATHNAME}
        className={classes.link}
      >
        You can only browse mods for now.
      </Link>
      <h2>Community Projects</h2>
      <h3 style={{marginTop: "2px"}}>Celeste Mountain Lego Idea</h3>
      <Image
        src={LEGO_CELESTE_IMAGE_URL}
        alt="A render of the proposed Celeste Mountain Lego set."
        height={height}
        width={width}
      />
      <p>
        A lego set for Celeste. 
        If you want this to exist, vote for it <a href="https://ideas.lego.com/projects/ac89cbf0-9d0b-401d-b8cb-5316056d498f" className={classes.link}>here</a>.
      </p>
    </Layout>
  );
};

export default Home;