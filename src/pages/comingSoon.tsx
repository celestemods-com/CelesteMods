import { type NextPage } from "next";
import { Layout } from "~/components/layout/layout";

const ComingSoon: NextPage = () => {
  return (
    <Layout pageTitle="Coming Soon" pageDescription="Coming Soon" pathname="/comingSoon">
      <h1>Coming soon</h1>
      <p>The site is currently in early beta. This feature has not been completed yet.</p>
    </Layout>
  );
};

export default ComingSoon;
