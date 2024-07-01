import type { NextApiRequest } from "next";
import { serverLogger as logger } from "~/logger/serverLogger";




const IP_HEADER_NAME = "CF-Connecting-IP";




/** Expects one IP address in the CF-Connecting-IP header */
const isValidIp = (
    request: NextApiRequest,
    validIps: string[],
): boolean => {
    const requestIp = request.headers[IP_HEADER_NAME];

    if (typeof requestIp !== "string" || requestIp === "") {
        return false;
    }


    const isValid = validIps.includes(requestIp);


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
    request: NextApiRequest,
    validIpsEnvironmentVariableName: string,
): number => {
    const validIpsString = process.env[validIpsEnvironmentVariableName];

    if (validIpsString === undefined) {
        logger.error(`The environment variable ${validIpsEnvironmentVariableName} is not defined.`);

        return 500;
    }


    const validIps = validIpsString.split(",");

    if (validIps.length === 0) {
        logger.error(`The environment variable ${validIpsEnvironmentVariableName} is empty.`);

        return 500;
    }


    const isValid = isValidIp(request, validIps);

    if (!isValid) {
        logger.info(`Invalid IP address: ${request.headers[IP_HEADER_NAME]}`);

        return 401;
    }


    return 200;
};