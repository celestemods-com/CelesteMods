//copied from https://dev.to/techcheck/custom-react-hook-usefetch-eid


import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';




export const useFetch = <T = any>(url: string) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [data, setData] = useState<T | null>(null);

    console.log(`useFetch fired with url: ${url}`);


    useEffect(
        () => {
            console.log("useFetch useEffect fired");

            const source = axios.CancelToken.source();


            const fetchData = async () => {
                console.log("useFetch fetchData fired");

                if (!url) {
                    console.log("No url provided");

                    setIsLoading(false);
                    setIsError(true);
                    setError("No url provided");
                    setData(null);


                    source.cancel();


                    return;
                }


                try {
                    console.log("useFetch fetchData try block fired");

                    setIsLoading(true);
                    setError(undefined);
                    setData(null);


                    const options: AxiosRequestConfig = {
                        url: url,
                        cancelToken: source.token,
                    };


                    console.log(`call axios with options: ${JSON.stringify(options)}`);

                    const axiosResponse = await axios(options);

                    console.log(`axiosResponse: ${JSON.stringify(axiosResponse)}`);

                    if (axiosResponse.status !== 200) throw `Error: ${axiosResponse.status}`;


                    const data = axiosResponse.data;

                    setData(data);
                } catch (error) {
                    console.log(`Error in useFetch: ${error}`);

                    setIsError(true);
                    setError(error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();


            return () => {
                source.cancel();
            };
        }, [url]);


    return { data, isLoading, isError, error };
};