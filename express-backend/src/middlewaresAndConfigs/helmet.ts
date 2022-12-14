import helmet, { HelmetOptions } from "helmet";



const helmetConfigObject: HelmetOptions = {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: false,//{ policy: "same-site" },
    expectCt: true,
    referrerPolicy: true,
    hsts: {
        maxAge: 2 * 365 * 24 * 60 * 60,     //2 years
        includeSubDomains: true,
        preload: true,
    },
    noSniff: true,
    originAgentCluster: true,
    dnsPrefetchControl: { allow: true },
    ieNoOpen: true,
    frameguard: { action: "sameorigin" },
    permittedCrossDomainPolicies: false,
    hidePoweredBy: true,
    xssFilter: true,
};


export const helmetMiddleware = helmet(helmetConfigObject);