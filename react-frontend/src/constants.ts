export const cmlBaseUri = process.env.NODE_ENV === "development" ? "http://127.0.0.1:3001/api/v1" : "https://celestemods.com/api/v1";




const qualitiesArray = ["Not Recommended", "Neutral", "Recommended", "Very Well Made", "Amazing"] as const;

export const qualities = {
    1: qualitiesArray[0],
    2: qualitiesArray[1],
    3: qualitiesArray[2],
    4: qualitiesArray[3],
    5: qualitiesArray[4],
};