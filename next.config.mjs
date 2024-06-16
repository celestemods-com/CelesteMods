import bundleAnalyzer from "@next/bundle-analyzer";


const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE_BUNDLE === "true",
});


/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {    //TODO!: figure out how to fix crash on next.config.mjs change
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.gamebanana.com",
        pathname: "**/img/ss/mods/**",
      },
      {
        protocol: "https",
        hostname: "ideascdn.lego.com",
        pathname: "/media/generate/lego_ci/**",
      }
    ],
  },

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  experimental: {
    largePageDataBytes: 3 * 1024 * 1024, // 3 MB
  },
};
export default withBundleAnalyzer(config);