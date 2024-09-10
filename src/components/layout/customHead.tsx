import Head from "next/head";
import type { LayoutProps } from "./layout";




type CustomHeadProps = Omit<Required<LayoutProps>, "children">;




export function CustomHead({
    pageTitle,
    pageDescription,
    pathname,
    siteName,
    robotsText,
    socialMediaImageUrl,
    socialMediaImageAlt,
}: CustomHeadProps) {
    const url = `https://celestemods.com/${pathname}`;


    return (
        <Head>
            <title>{pageTitle}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            {/*   //TODO: figure out if any of these are needed
            <base href="https://celestemods.com" />
            <meta http-equiv="Content-Security-Policy" content="default-src 'self'" />

            <link rel="preload" href="/media/renogare/renogare_regular.woff2" as="font" type="font/woff2" crossOrigin />
            */}


            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta name="robots" content={robotsText} />

            <meta name="application-name" content={siteName} />


            {/* generated using https://realfavicongenerator.net */}
            {/*favicons*/}
            <link rel="apple-touch-icon" sizes="180x180" href="/images/logo/icon/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/images/logo/icon/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/images/logo/icon/favicon-16x16.png" />
            <link rel="manifest" href="/images/logo/icon/site.webmanifest" />
            <link rel="mask-icon" href="/images/logo/icon/safari-pinned-tab.svg" color="#5bbad5" />
            <link rel="shortcut icon" href="/images/logo/icon/favicon.ico" />
            <meta name="msapplication-TileColor" content="#2d89ef" />
            <meta name="msapplication-config" content="/images/logo/icon/browserconfig.xml" />
            <meta name="theme-color" content="#2d89ef" />


            {/*Facebook embed stuff*/}
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:image" content={socialMediaImageUrl} />
            <meta property="og:image:alt" content={socialMediaImageAlt} />
            <meta property="og:locale" content="en_US" />

            {/*Twitter embed stuff*/}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={socialMediaImageUrl} />
            <meta name="twitter:image:alt" content={socialMediaImageAlt} />
        </Head>
    );
}