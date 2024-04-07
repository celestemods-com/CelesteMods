import { type NextPage } from "next";
import Link from "next/link";
import { Layout } from "~/components/layout/layout";
import { MODS_PAGE_PATHNAME } from "~/consts/pathnames";




const Home: NextPage = () => {
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
      >
        You can only browse mods for now.
      </Link>
    </Layout>
  );
};

export default Home;