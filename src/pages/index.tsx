import { type NextPage } from "next";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { Layout } from "~/components/layout/layout";

const Home: NextPage = () => {

  return (
    <Layout pageTitle="Home" pageDescription="Home" pathname="/">
      <h1>Celeste Mods List</h1>
      <p>Welcome! The site is currently in early beta.</p>
      <Link
        href={"/mods"}
      >
        You can only browse mods for now.
      </Link>
    </Layout>
  );
};

export default Home;
