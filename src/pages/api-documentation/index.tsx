import { MantineProvider } from "@mantine/core";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const ApiDocumentation: NextPage = () => {
    return (
        <MantineProvider withGlobalStyles theme={{
            colorScheme: 'light'
        }}>
            <SwaggerUI url="/api/openapi.json" />
        </MantineProvider>
    );
};

export default ApiDocumentation;