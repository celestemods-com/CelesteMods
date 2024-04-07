import type { NextPage } from "next";
import Link from "next/link";
import { Flex, Text, Title } from "@mantine/core";
import { Layout } from "~/components/layout/layout";
import { OLYMPUS_INSTALLATION_URL } from "~/consts/olympusInstallationUrl";




const FAQ: NextPage = () => {
    return (
        <Layout
            pageTitle="FAQ"
            pageDescription="FAQ"
            pathname="/faq"
        >
            <Flex
                direction={"column"}
                wrap={"wrap"}
            >
                <Title order={2}>Installing Mods</Title>
                <Title order={3}>Everest</Title>
                <Text>
                    Everest is the modding API for Celeste. It is required to install most mods, and is installed automatically when setting up Olympus. If you need to install Everest manually, you can find it on their <Link href={"https://github.com/EverestAPI/Everest/releases"}>GitHub</Link>.
                </Text>
                <Title order={3}>Mod Managers</Title>
                <Title order={4}>Olympus</Title>
                <Text>
                    Olympus is the recommended mod manager for Celeste. Everest is installed automatically during setup. You can find installation instructions for Windows, Mac, and Linux on the <Link href={OLYMPUS_INSTALLATION_URL}>Everest website</Link>.
                </Text>
                <Title order={4}>CeleMod</Title>
                <Text>
                    CeleMod is a new alternative mod manager for Celeste. You can find installation instructions on <Link href={"https://gamebanana.com/tools/16200"}>GameBanana</Link>.
                </Text>
                <Title order={4}>Mons</Title>
                <Text>
                    Mons is a commandline Everest installer and mod manager for Celeste. You can find installation instructions on <Link href={"https://github.com/coloursofnoise/mons"}>their GitHub</Link>.
                </Text>
                <Title order={2}>Other FAQ</Title>
                <Text>Coming soon!</Text>
            </Flex>
        </Layout>
    );
};

export default FAQ;