import { getGamebananaApiUrl } from "./getGamebananaApiUrl";
import { fetchWithAxios } from "../useFetch";
import { GAMEBANANA_API_ERROR_STRING, type GamebananaApiResponse } from "./typesAndConsts";
import type { CancelTokenSource } from "axios";
import type { JavascriptTypeString } from "~/consts/javascriptTypeStrings";




export type ModDownloadurl = string | undefined;


const GAMEBANANA_MOD_DOWNLOAD_BASE_URL = "everest:https://gamebanana.com/mmdl/";

const GAMEBANANA_MOD_FILES_LIST_FIELD = "Files().aFiles()";


type GamebananaFileMetadataObject = {
	[GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD]: number;
};

type GamebananaFilesObject = Record<string, GamebananaFileMetadataObject>;


const GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD = "_tsDateAdded";

const GAMEBANANA_FILE_METADATA_REQUIRED_FIELDS = {
	[GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD]: "number",
} as const satisfies Record<keyof GamebananaFileMetadataObject, JavascriptTypeString>;

const gamebananaFileMetadataRequiredFieldsCount = Object.keys(GAMEBANANA_FILE_METADATA_REQUIRED_FIELDS).length;


type GamebananaFileMetadataKey = keyof typeof GAMEBANANA_FILE_METADATA_REQUIRED_FIELDS;




const isValidGamebananaFilesObject = (
	data: unknown,
	allowNonStringKeysInFileMetadataObject: boolean,
	keysToCheck: string[],
	allowUncheckedStringKeys: boolean,
): data is GamebananaFilesObject => {
	if (typeof data !== "object" || data === null) return false;

	const dataObject = data as Record<string, unknown>;


	if (Object.keys(dataObject).length === 0) return false; // Ensure there is at least one file


	for (const [key, value] of Object.entries(dataObject)) {
		if (typeof key !== "string") return false;


		// const keyAsNumber = Number(key);
		// if (isNaN(keyAsNumber)) console.warn(`Key "${key}" in GameBanana files object is not a valid number. Object: ${JSON.stringify(dataObject)}`);


		if (!isValidGamebananaFileMetadataObject(value, allowNonStringKeysInFileMetadataObject, keysToCheck, allowUncheckedStringKeys)) {
			console.error(`Invalid GameBanana file metadata for key "${key}": ${JSON.stringify(value)}`);

			return false;
		}
	}


	return true;
};


const isValidGamebananaFileMetadataObject = (
	fileMetadata: unknown,
	allowNonStringKeysInFileMetadataObject: boolean,
	keysToCheck: string[],
	allowUncheckedStringKeys: boolean,
): fileMetadata is Record<string, GamebananaFileMetadataObject> => {
	if (typeof fileMetadata !== "object" || fileMetadata === null) return false;

	const fileMetadataObject = fileMetadata as Record<string, unknown>;


	const keyCount = Object.keys(fileMetadataObject).length;

	if (keyCount < gamebananaFileMetadataRequiredFieldsCount) {
		console.error(`GameBanana file metadata object has too few keys. Expected at least ${gamebananaFileMetadataRequiredFieldsCount}, got ${keyCount}. Object: ${JSON.stringify(fileMetadataObject)}`);

		return false;
	}

	for (const [key, value] of Object.entries(fileMetadataObject)) {
			if (!isValidGamebananaFileMetadataKeyValuePair(key, value, allowNonStringKeysInFileMetadataObject, keysToCheck, allowUncheckedStringKeys)) return false;
	}


	return true;
};


const isValidGamebananaFileMetadataKeyValuePair = (
	key: unknown,
	value: unknown,
	allowNonStringKeysInFileMetadataObject: boolean,
	keysToCheck: string[],
	allowUncheckedStringKeys: boolean,
): value is GamebananaFileMetadataObject[keyof GamebananaFileMetadataObject] => {
	if (typeof key !== "string") {
		if (allowNonStringKeysInFileMetadataObject) {
			console.log(`Accepting non-string key in Gamebanana file metadata object: ${key}`);

			return true;
		} else {
			return false;
		}
	} else {
		const isCheckedKey = isCheckedGamebananaMetadataStringKey(key, keysToCheck);

		if (isCheckedKey && !allowUncheckedStringKeys) return false;


		const checkedKey = key as GamebananaFileMetadataKey;	// Checked by isCheckedGamebananaMetadataStringKey above

		return isCheckedGamebananaMetadataValue(checkedKey, value);
	}
};


const isCheckedGamebananaMetadataStringKey = (
	key: string,
	keysToCheck: string[],
): key is GamebananaFileMetadataKey => {
	for (const keyToCheck of keysToCheck) {
		if (key === keyToCheck) {
			return true;
		}
	}


	return false;
};


const isCheckedGamebananaMetadataValue = (
	key: GamebananaFileMetadataKey,
	value: unknown,
): value is GamebananaFileMetadataObject[GamebananaFileMetadataKey] => {
	const expectedType = GAMEBANANA_FILE_METADATA_REQUIRED_FIELDS[key];


	const isValidValue = typeof value === expectedType;

	if (!isValidValue) {
		console.error(`Invalid type for GameBanana file metadata key "${key}". Expected "${expectedType}", got "${typeof value}". Value: ${JSON.stringify(value)}`);
	}


	return isValidValue;
};




export const getModDownloadUrl = async (
	gamebananaModId: number,
	source: CancelTokenSource,
): Promise<ModDownloadurl> => {
	//get query url
	const DEFAULT_GAMEBANANA_API_URL_PROPS = {
		itemType: "Mod",
		itemId: gamebananaModId,
		fields: GAMEBANANA_MOD_FILES_LIST_FIELD,
		returnKeys: true,
	} as const;

	const queryUrl = getGamebananaApiUrl(DEFAULT_GAMEBANANA_API_URL_PROPS);


	const data = await fetchWithAxios<GamebananaApiResponse<true, typeof GAMEBANANA_MOD_FILES_LIST_FIELD>>(queryUrl, source);
	console.error(JSON.stringify(data));


	let filesObject = data ? data[GAMEBANANA_MOD_FILES_LIST_FIELD] : undefined;

	if (filesObject) {
		if (!isValidGamebananaFilesObject(filesObject, true, [GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD], true)) {
			console.error(`Invalid GameBanana files object: ${JSON.stringify(filesObject)}`);
			//throw new Error(GAMEBANANA_API_ERROR_STRING);
		}
	}
	else {
		console.error("Undefined files object.");
		return undefined;
	}


	let newestFileId = "";
	let newestFileDateAdded = 0;

	for (const [fileId, fileData] of Object.entries(filesObject)) {
		const dateAdded = fileData[GAMEBANANA_MOD_FILE_DATE_ADDED_FIELD];

		if (dateAdded > newestFileDateAdded) {
			newestFileId = fileId;
			newestFileDateAdded = dateAdded;
		}
	}


	const downloadUrl = newestFileId === "" ? "" : `${GAMEBANANA_MOD_DOWNLOAD_BASE_URL}${newestFileId},Mod,${gamebananaModId}`;


	return downloadUrl;
};