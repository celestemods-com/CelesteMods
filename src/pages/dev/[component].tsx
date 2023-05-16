import { Loader } from "@mantine/core";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { Layout } from "~/components/layout/layout";
import { Navbar } from "~/components/layout/navbar";




export const validComponentNames = ["layout", "navbar"];

export default function TestComponent() {
    const router = useRouter();
    let errorString: string | undefined = undefined;


    const [componentName, setComponentName] = useState<string | null>(null);


    useEffect(() => {
        if (!router.isReady) setComponentName(null);

        if (typeof router.query.component !== "string") {
            errorString = "Component name is not a string.";
            return;
        }

        setComponentName(router.query.component);
    }, [router.isReady]);


    console.log(componentName);


    if (errorString) return errorString;


    switch (componentName) {
        case null: {
            return "Loading...";
        }
        case validComponentNames[0]: {
            return (
                <>
                    Not yet implemented.
                </>
            );
        }
        case validComponentNames[1]: {
            return (
                <>
                    <Navbar pathname="test" pages={[{label: "Test Label", pathname: "/"}]}/>
                </>
            );
        }
        default: {
            return (
                <>
                    {`"${componentName}" is not a valid component name. Valid component names are: ${validComponentNames.join(", ")}.`}
                </>
            );
        }
    };
}