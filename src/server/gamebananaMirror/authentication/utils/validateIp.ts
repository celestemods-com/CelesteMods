import type { headers } from "next/headers";
import { serverLogger as logger } from "~/logger/serverLogger";




const IP_HEADER_NAME = "CF-Connecting-IP";




/** Expects one IP address in the CF-Connecting-IP header */
const isValidIp = (
    requestIpHeaderString: string,
    validIps: string[],
): boolean => {
    if (requestIpHeaderString === "") {
        return false;
    }


    const isValid = validIps.includes(requestIpHeaderString);


    return isValid;
};




/** Expects one IP address in the CF-Connecting-IP header.
 * The environment variable should be a comma-separated list of IP addresses.
 * This function returns HTTP status codes.
 * 200: The ip is valid.
 * 401: The ip is invalid.
 * 500: Other error.
 */
export const validateIp = (
    requestHeadersList: ReturnType<typeof headers>,
    validIpsEnvironmentVariableName: string,
): number => {
    const validIpsString = process.env[validIpsEnvironmentVariableName];

    if (validIpsString === undefined) {
        logger.error(`The environment variable ${validIpsEnvironmentVariableName} is not defined.`);

        return 500;
    }


    const requestIpHeader = requestHeadersList.get(IP_HEADER_NAME);

    
    if (process.env.NODE_ENV !== "development") {
        const validIps = validIpsString.split(",");

        if (validIps.length === 0) {
            logger.error(`The environment variable ${validIpsEnvironmentVariableName} is empty.`);

            return 500;
        }


        if (requestIpHeader === null) {
            logger.info(`The request did not contain the ${IP_HEADER_NAME} header.`);

            return 401;
        }


        const isValid = isValidIp(requestIpHeader, validIps);

        if (!isValid) {
            logger.info(`Invalid IP address: ${requestIpHeader}`);

            return 401;
        }
    }


    logger.info(`Valid IP address: ${requestIpHeader}`);

    return 200;
};