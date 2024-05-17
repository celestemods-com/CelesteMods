import { createStyles } from "@mantine/core";
import { type NextPage } from "next";
import Link from "next/link";
import { Layout } from "~/components/layout/layout";
import { MODS_PAGE_PATHNAME } from "~/consts/pathnames";



const useStyles = createStyles(
  () => ({
    link: {
      textDecoration: "underline",
    },
  }),
);

const Home: NextPage = () => {
  const { classes } = useStyles();

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
      <h2>Community projects</h2>
      <h3>Celeste Mountain Lego</h3>
      <p>
        A lego set for Celeste. 
        You can check it out <a href="https://ideas.lego.com/projects/ac89cbf0-9d0b-401d-b8cb-5316056d498f" className={classes.link}>here</a>.
      </p>
    </Layout>
  );
};

export default Home;