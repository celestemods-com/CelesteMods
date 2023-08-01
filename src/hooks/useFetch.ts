//copied from https://dev.to/techcheck/custom-react-hook-usefetch-eid


import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';




export const useFetch = <T = any>(url: string) => {
    const [data, setData] = useState<T>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<any>();


    useEffect(
        () => {
            async () => {
                const source = axios.CancelToken.source();


                try {
                    setIsLoading(true);
                    setData(undefined);
                    setError(undefined);


                    const options: AxiosRequestConfig = {
                        url: url,
                        cancelToken: source.token,
                    };


                    const axiosResponse = await axios(options);

                    if (axiosResponse.status !== 200) throw `Error: ${axiosResponse.status}`;


                    const data = axiosResponse.data;

                    setData(data);
                    setIsLoading(false);
                } catch (error) {
                    setIsLoading(false);
                    setIsError(true);
                    setError(error);
                }


                return () => {
                    source.cancel();
                };
            };
        }, [url]);


    return { data, isLoading, isError, error };
};