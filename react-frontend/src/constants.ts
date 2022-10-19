export const cmlBaseUrl = process.env.NODE_ENV === "development" ? "http://127.0.0.1:3001/api/v1" : "https://celestemods.com/api/v1";
export const gamebananaBaseImageUrl = "https://images.gamebanana.com/img/ss/mods/";
export const gamebananaScreenshotsRequestUrl = "https://api.gamebanana.com/Core/Item/Data?itemtype=Mod&fields=screenshots&return_keys=true&itemid=";




const qualitiesArray = ["Not Recommended", "Neutral", "Recommended", "Very Well Made", "Amazing"] as const;

export const qualities = {
    1: qualitiesArray[0],
    2: qualitiesArray[1],
    3: qualitiesArray[2],
    4: qualitiesArray[3],
    5: qualitiesArray[4],
};