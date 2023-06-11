import { type NextPage } from "next";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";

const Home: NextPage = () => {

  return (
    <>
      <div>
        <h1>
          Create <span>T3</span> App
        </h1>
        <div>
          <Link
            href="https://create.t3.gg/en/usage/first-steps"
            target="_blank"
          >
            <h3>First Steps →</h3>
            <div>
              Just the basics - Everything you need to know to set up your
              database and authentication.
            </div>
          </Link>
          <Link
            href="https://create.t3.gg/en/introduction"
            target="_blank"
          >
            <h3>Documentation →</h3>
            <div>
              Learn more about Create T3 App, the libraries it uses, and how
              to deploy it.
            </div>
          </Link>
        </div>
        <div>
          <AuthShowcase />
        </div>
      </div>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.difficulty.getMany.useQuery(
    {
      pageNumber: 5,
      pageSize: 5,
    },
    {
      enabled: sessionData?.user !== undefined
    },
  );

  return (
    <div>
      <p>
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
