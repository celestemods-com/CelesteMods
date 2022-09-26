import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { formattedMod } from "../../Imported_Types/frontend";


export const celestemodsApi = createApi({
    reducerPath: "celestemodsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "https://celestemods.com/api/v1/"}),
    endpoints: (build) => ({
        getMods: build.query<formattedMod[], void>({
            query: () => "mods",
        }),
    }),
})