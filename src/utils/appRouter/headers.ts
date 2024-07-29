import type { headers } from "next/headers";


export type AppRouter_RequestHeader = ReturnType<ReturnType<typeof headers>["get"]>;