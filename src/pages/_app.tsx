import "~/styles/globals.css";

import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";

import { api } from "~/utils/api";
import { RouterTransition } from "~/components/routerTransition";
import { emotionCache } from "~/emotionCache";




const MyApp: AppType<{ session: Session | null; }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <MantineProvider
        emotionCache={emotionCache}
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "dark",
        }}
      >
        <RouterTransition />
        <Component {...pageProps} />
      </MantineProvider>
    </SessionProvider>
  );
};




export default api.withTRPC(MyApp);