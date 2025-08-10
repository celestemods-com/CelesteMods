import { getGamebananaApiUrl } from "./getGamebananaApiUrl";
import { fetchWithAxios } from "../useFetch";
import { GAMEBANANA_API_ERROR_STRING, GAMEBANANA_API_ITEM_TYPE_MODS_IDENTIFIER, GAMEBANANA_MOD_METADATA_FIELDS_TYPE, type GamebananaApiResponse } from "./typesAndConsts";
import type { CancelTokenSource } from "axios";
import { JavascriptTypeString } from "~/consts/javascriptTypeStrings";




export type ModImageUrls = string[];


const GAMEBANANA_MOD_IMAGES_BASE_URL = "https://images.gamebanana.com/img/ss/mods/";

const GAMEBANANA_MOD_PREVIEW_MEDIA_FIELD = "_aPreviewMedia" as const;

const GAMEBANANA_MOD_SCREENSHOTS_LIST_FIELD = "_aImages" as const;

const GAMEBANANA_MOD_SCREENSHOT_ORIGINAL_FILE_NAME_FIELD = "_sFile" as const;


/** Contains other properties, but we don't use them so they aren't specified or checked. */
type GamebananaScreenshotMetadataataObject = {
    [GAMEBANANA_MOD_SCREENSHOT_ORIGINAL_FILE_NAME_FIELD]: string;
};

type GamebananaScreenshotMetadataRequiredKey = keyof GamebananaScreenshotMetadataataObject;

type GamebananaScreenshotMetadataRequiredValue = GamebananaScreenshotMetadataataObject[GamebananaScreenshotMetadataRequiredKey];


type GamebananaScreenshotMetadataObjectsArray = [GamebananaScreenshotMetadataataObject, ...GamebananaScreenshotMetadataataObject[]];


type GamebananaPreviewMediaObject = {
	[GAMEBANANA_MOD_SCREENSHOTS_LIST_FIELD]: GamebananaScreenshotMetadataObjectsArray;
};


const GAMEBANANA_SCREENSHOT_METADATA_REQUIRED_FIELDS = {
	[GAMEBANANA_MOD_SCREENSHOT_ORIGINAL_FILE_NAME_FIELD]: "string",
} as const satisfies Record<keyof GamebananaScreenshotMetadataataObject, JavascriptTypeString>;

const gamebananaScreenshotMetadataRequiredKeys = Object.keys(GAMEBANANA_SCREENSHOT_METADATA_REQUIRED_FIELDS) as GamebananaScreenshotMetadataRequiredKey[];

const gamebananaScreenshotMetadataRequiredFieldsCount = gamebananaScreenshotMetadataRequiredKeys.length;




const isValidGamebananaPreviewMediaObject = (
	data: unknown,
): data is GamebananaPreviewMediaObject => {
	if (typeof data !== "object" || data === null) return false;

	const dataObject = data as Record<string, unknown>;
	

	const screenshotDataArray = dataObject[GAMEBANANA_MOD_SCREENSHOTS_LIST_FIELD];

	
	return isValidGamebananaScreenshotDataArray(screenshotDataArray);
};


const isValidGamebananaScreenshotDataArray = (screenshotData: unknown): screenshotData is GamebananaScreenshotMetadataObjectsArray => {
    if (!Array.isArray(screenshotData)) return false;


	if (screenshotData.length === 0) return false; // Ensure there is at least one screenshot


    return screenshotData.every(isValidGamebananaScreenshotMetadataObject);
};


const isValidGamebananaScreenshotMetadataObject = (
    screenshotMetadata: unknown
): screenshotMetadata is GamebananaScreenshotMetadataataObject => {   // tried to create as assertion, but encountered weird ts error
    if (typeof screenshotMetadata !== "object" || screenshotMetadata === null) return false;
	
	const screenshotMetadataObject = screenshotMetadata as Record<string, unknown>;


	const keyCount = Object.keys(screenshotMetadataObject).length;

	if (keyCount < gamebananaScreenshotMetadataRequiredFieldsCount) {
		// console.error(`GameBanana screenshot metadata object has too few keys. Expected at least ${gamebananaScreenshotMetadataRequiredFieldsCount}, got ${keyCount}. Object: ${JSON.stringify(screenshotMetadataObject)}`);

		return false; // Not enough keys
	}


	for (const [ key, value ] of Object.entries(screenshotMetadataObject)) {
		if (!isValidGamebananaScreenshotMetadataKeyValuePair(key, value)) {
			return false;
		}
	}


	return true;
};


const isValidGamebananaScreenshotMetadataKeyValuePair = (
	key: unknown,
	value: unknown,
): boolean => {
	if (typeof key !== "string") return true; // Ignore non-string keys


	const isRequiredKey = gamebananaScreenshotMetadataRequiredKeys.includes(key as GamebananaScreenshotMetadataRequiredKey);

	if (!isRequiredKey) return true; // Ignore non-required keys


	const expectedType = GAMEBANANA_SCREENSHOT_METADATA_REQUIRED_FIELDS[key as GamebananaScreenshotMetadataRequiredKey];


	const isValidValue = typeof value === expectedType;

	// if (!isValidValue) {
		// console.error(`Invalid GameBanana screenshot metadata value for key "${key}": expected ${expectedType}, got ${typeof value}. Value: ${JSON.stringify(value)}`);
	// }


	return isValidValue;
};




export const getModImageUrls = async (
    gamebananaModId: number,
    source: CancelTokenSource,
): Promise<ModImageUrls> => {
    // get query url
    const DEFAULT_GAMEBANANA_API_URL_PROPS = {
        itemType: GAMEBANANA_API_ITEM_TYPE_MODS_IDENTIFIER,
        itemId: gamebananaModId,
		fieldType: GAMEBANANA_MOD_METADATA_FIELDS_TYPE,
        field: GAMEBANANA_MOD_PREVIEW_MEDIA_FIELD,
    } as const;

    const queryUrl = getGamebananaApiUrl(DEFAULT_GAMEBANANA_API_URL_PROPS);


    const data = await fetchWithAxios<GamebananaApiResponse>(queryUrl, source);
	// console.error(JSON.stringify(data));


    // get screenshotData
    const previewMediaObject = data ? data[GAMEBANANA_MOD_PREVIEW_MEDIA_FIELD] : undefined;
	
	if (!previewMediaObject) {
		// console.error("Undefined preview media object.");
		return [];
	}


    if (!isValidGamebananaPreviewMediaObject(previewMediaObject)) {
		// console.error(`Invalid GameBanana preview media object: ${JSON.stringify(previewMediaObject)}`);
		throw new Error(GAMEBANANA_API_ERROR_STRING);
	}


	const screenshotsDataArray = previewMediaObject[GAMEBANANA_MOD_SCREENSHOTS_LIST_FIELD];


    const imageUrls = screenshotsDataArray.map(
        ({ _sFile }) => `${GAMEBANANA_MOD_IMAGES_BASE_URL}${_sFile}`,
    );


    return imageUrls;
};