import { type LayoutProps } from "./layout";




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
        <>
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

            {/*favicons*/}
            <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/img/icon/apple-touch-icon-57x57.png" />
            <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/img/icon/apple-touch-icon-114x114.png" />
            <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/img/icon/apple-touch-icon-72x72.png" />
            <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/img/icon/apple-touch-icon-144x144.png" />
            <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/img/icon/apple-touch-icon-60x60.png" />
            <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/img/icon/apple-touch-icon-120x120.png" />
            <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/img/icon/apple-touch-icon-76x76.png" />
            <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/apple-touch-icon-152x152.png" />
            <link rel="icon" type="image/png" sizes="196x196" href="/img/icon/favicon-196x196.png" />
            <link rel="icon" type="image/png" sizes="96x96" href="/img/icon/favicon-96x96.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/img/icon/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/img/icon/favicon-16x16.png" />
            <link rel="icon" type="image/png" sizes="128x128" href="/img/icon/favicon-128.png" />
            <meta name="application-name" content={siteName} />
            <meta name="msapplication-TileColor" content="#FFFFFF" />
            <meta name="msapplication-TileImage" content="/img/icon/mstile-144x144.png" />
            <meta name="msapplication-square70x70logo" content="/img/icon/mstile-70x70.png" />
            <meta name="msapplication-square150x150logo" content="/img/icon/mstile-150x150.png" />
            <meta name="msapplication-square310x310logo" content="/img/icon/mstile-310x310.png" />

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
        </>
    );
}