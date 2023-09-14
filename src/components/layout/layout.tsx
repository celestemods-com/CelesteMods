import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { CustomHead } from "./customHead";




export type LayoutProps = {
    children: React.ReactNode;
    pageTitle: string;
    pageDescription: string;
    pathname: string;
    siteName?: string;
    robotsText?: string;
    socialMediaImageUrl?: string;
    socialMediaImageAlt?: string;
};




export function Layout({
    children,
    pageTitle,
    pageDescription,
    pathname,
    siteName = "Celeste Mods List",
    robotsText = "index,follow,nositelinkssearchbox",
    socialMediaImageUrl = "https://celestemods.com/img/cml_icon.png",
    socialMediaImageAlt = "Celeste Mods List Logo",
}: LayoutProps) {
    return (
        <>
            <Head>
                <CustomHead
                    pageTitle={pageTitle}
                    pageDescription={pageDescription}
                    pathname={pathname}
                    siteName={siteName}
                    robotsText={robotsText}
                    socialMediaImageUrl={socialMediaImageUrl}
                    socialMediaImageAlt={socialMediaImageAlt}
                />
            </Head>
            <header>
                {home ? (
                    <>
                        <Image
                            priority
                            src="/images/cml_icon.png"
                            className={utilStyles.borderCircle}
                            height={144}
                            width={144}
                            alt={name}
                        />
                        <h1 className={utilStyles.heading2Xl}>{name}</h1>
                    </>
                ) : (
                    <>
                        <Link href="/">
                            <Image
                                priority
                                src="/images/cml_icon.png"
                                className={utilStyles.borderCircle}
                                height={108}
                                width={108}
                                alt={name}
                            />
                        </Link>
                        <h2 className={utilStyles.headingLg}>
                            <Link href="/" className={utilStyles.colorInherit}>
                                {name}
                            </Link>
                        </h2>
                    </>
                )}
            </header>
            <main>{children}</main>
        </>
    );
}