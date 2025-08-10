import { getGamebananaApiUrl } from "./getGamebananaApiUrl";
import { fetchWithAxios } from "../useFetch";
import { GAMEBANANA_API_ERROR_STRING, GAMEBANANA_API_ITEM_TYPE_MODS_IDENTIFIER, GAMEBANANA_MOD_METADATA_FIELDS_TYPE, type GamebananaApiResponse } from "./typesAndConsts";
import type { CancelTokenSource } from "axios";
import type { JavascriptTypeString } from "~/consts/javascriptTypeStrings";




export type ModDownloadurl = string | undefined;


const GAMEBANANA_MOD_DOWNLOAD_BASE_URL = "everest:https://gamebanana.com/mmdl/";

const GAMEBANANA_MOD_FILES_LIST_FIELD = "_aFiles";

const GAMEBANANA_MOD_FILE_ID_FIELD = "_idRow";
const GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD = "_tsDateAdded";


/** Contains other properties, but we don't use them so they aren't specified or checked. */
type GamebananaFileMetadataObject = {
	[GAMEBANANA_MOD_FILE_ID_FIELD]: number;
	[GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD]: number;
};

type GamebananaFileMetadataRequiredKey = keyof GamebananaFileMetadataObject;

type GamebananaFileMetadataRequiredValue = GamebananaFileMetadataObject[GamebananaFileMetadataRequiredKey];


type GamebananaFilesArray = [GamebananaFileMetadataObject, ...GamebananaFileMetadataObject[]];


const GAMEBANANA_FILE_METADATA_REQUIRED_FIELDS = {
	[GAMEBANANA_MOD_FILE_ID_FIELD]: "number",
	[GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD]: "number",
} as const satisfies Record<keyof GamebananaFileMetadataObject, JavascriptTypeString>;

const gamebananaFileMetadataRequiredKeys = Object.keys(GAMEBANANA_FILE_METADATA_REQUIRED_FIELDS) as GamebananaFileMetadataRequiredKey[];

const gamebananaFileMetadataRequiredFieldsCount = gamebananaFileMetadataRequiredKeys.length;




const isValidGamebananaFilesArray = (
	data: unknown,
): data is GamebananaFilesArray => {
	if (!Array.isArray(data)) return false;

	const dataArray = data as unknown[];


	if (dataArray.length === 0) return false; // Ensure there is at least one file


	for (const element of dataArray) {
		if (!isValidGamebananaFileMetadataObject(element)) {
			// console.error(`Invalid GameBanana file metadata for element: ${JSON.stringify(element)}`);

			return false;
		}
	}


	return true;
};


const isValidGamebananaFileMetadataObject = (
	fileMetadata: unknown,
): fileMetadata is Record<GamebananaFileMetadataRequiredKey, GamebananaFileMetadataRequiredValue> => {
	if (typeof fileMetadata !== "object" || fileMetadata === null) return false;

	const fileMetadataObject = fileMetadata as Record<string, unknown>;


	const keyCount = Object.keys(fileMetadataObject).length;

	if (keyCount < gamebananaFileMetadataRequiredFieldsCount) {
		// console.error(`GameBanana file metadata object has too few keys. Expected at least ${gamebananaFileMetadataRequiredFieldsCount}, got ${keyCount}. Object: ${JSON.stringify(fileMetadataObject)}`);

		return false;
	}


	for (const [key, value] of Object.entries(fileMetadataObject)) {
		if (!isValidGamebananaFileMetadataKeyValuePair(key, value)) return false;
	}


	return true;
};


const isValidGamebananaFileMetadataKeyValuePair = (
	key: unknown,
	value: unknown,
): boolean => {
	if (typeof key !== "string") return true; // Ignore non-string keys


	const isRequiredKey = gamebananaFileMetadataRequiredKeys.includes(key as GamebananaFileMetadataRequiredKey);

	if (!isRequiredKey) return true; // Ignore non-required keys


	const expectedType = GAMEBANANA_FILE_METADATA_REQUIRED_FIELDS[key as GamebananaFileMetadataRequiredKey];


	const isValidValue = typeof value === expectedType;

	// if (!isValidValue) {
	// 	console.error(`Invalid type for GameBanana file metadata key "${key}". Expected "${expectedType}", got "${typeof value}". Value: ${JSON.stringify(value)}`);
	// }


	return isValidValue;
};




export const getModDownloadUrl = async (
	gamebananaModId: number,
	source: CancelTokenSource,
): Promise<ModDownloadurl> => {
	//get query url
	const DEFAULT_GAMEBANANA_API_URL_PROPS = {
		itemType: GAMEBANANA_API_ITEM_TYPE_MODS_IDENTIFIER,
		itemId: gamebananaModId,
		fieldType: GAMEBANANA_MOD_METADATA_FIELDS_TYPE,
		field: GAMEBANANA_MOD_FILES_LIST_FIELD,
	} as const;

	const queryUrl = getGamebananaApiUrl(DEFAULT_GAMEBANANA_API_URL_PROPS);


	const data = await fetchWithAxios<GamebananaApiResponse>(queryUrl, source);
	// console.error(JSON.stringify(data));


	const filesArray = data ? data[GAMEBANANA_MOD_FILES_LIST_FIELD] : undefined;

	if (!filesArray) {
		// console.error("Undefined files object.");
		return undefined;
	}


	if (!isValidGamebananaFilesArray(filesArray)) {
		// console.error(`Invalid GameBanana files object: ${JSON.stringify(filesObject)}`);
		throw new Error(GAMEBANANA_API_ERROR_STRING);
	}


	let newestFileId = "";
	let newestFileDateAdded = 0;

	for (const [fileId, fileData] of Object.entries(filesArray)) {
		const dateAdded = fileData[GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD];

		if (dateAdded > newestFileDateAdded) {
			newestFileId = fileId;
			newestFileDateAdded = dateAdded;
		}
	}


	const downloadUrl = newestFileId === "" ? "" : `${GAMEBANANA_MOD_DOWNLOAD_BASE_URL}${newestFileId},Mod,${gamebananaModId}`;


	return downloadUrl;
};