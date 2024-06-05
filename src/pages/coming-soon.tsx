import { type NextPage } from "next";
import { Layout } from "~/components/layout/layout";
import { COMING_SOON_PATHNAME } from "~/consts/pathnames";




const ComingSoon: NextPage = () => {
  return (
    <Layout
      pageTitle="Coming Soon"
      pageDescription="Coming Soon"
      pathname={COMING_SOON_PATHNAME}
      robotsText="noindex,nofollow,nositelinkssearchbox"
    >
      <h1>Coming Soon</h1>
      <p>The site is currently in early beta. This feature has not been completed yet.</p>
    </Layout>
  );
};

export default ComingSoon;