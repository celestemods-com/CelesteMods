
type GetGamebananaUrlProps = {      //TODO: update this to encode narrower types based on itemType
    itemType: string;
    itemId: number;
    fields: string | string[];
};


export type GamebananaResponse = string[];



const GAMEBANANA_BASE_URL = "api.gamebanana.com/Core/Item/Data";



export const getGamebananaUrl = (
    {
        itemType,
        itemId,
        fields,
    }: GetGamebananaUrlProps
) => {
    const fieldsString = typeof fields === "string" ? fields : fields.join(",");


    return `https://${GAMEBANANA_BASE_URL}?itemtype=${itemType}&itemid=${itemId}&fields=${fieldsString}`;
};