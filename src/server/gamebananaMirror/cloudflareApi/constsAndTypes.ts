
const GAMEBANANA_MIRROR_DOMAIN = "celestemodupdater.celestemods.com";

export const GAMEBANANA_MIRROR_WORKER_URL = `https://${GAMEBANANA_MIRROR_DOMAIN}/worker`;

export const DELETE_BATCH_SIZE = 50;




export const FILE_CATEGORIES = ["mods", "screenshots", "richPresenceIcons"] as const satisfies string[];

export type FileCategory = typeof FILE_CATEGORIES[number];

export const isFileCategory = (value: unknown): value is FileCategory => FILE_CATEGORIES.includes(value as FileCategory);


const modsBucketName = process.env.GAMEBANANA_MIRROR_CLOUDFLARE_R2_MODS_BUCKET_NAME ?? "";
const screenshotsBucketName = process.env.GAMEBANANA_MIRROR_CLOUDFLARE_R2_SCREENSHOTS_BUCKET_NAME ?? "";
const richPresenceIconsBucketName = process.env.GAMEBANANA_MIRROR_CLOUDFLARE_R2_RICH_PRESENCE_ICONS_BUCKET_NAME ?? "";

export const R2_BUCKET_NAMES = {
	mods: modsBucketName,
	screenshots: screenshotsBucketName,
	richPresenceIcons: richPresenceIconsBucketName,
} as const satisfies Record<FileCategory, string>;




type RequestBody_Base = {
	fileCategory: FileCategory;
};

type PutRequestBody_Base = {
	fileName: string;
} & RequestBody_Base;

export type FileDownloadRequestBody = {
	downloadUrl: string;
} & PutRequestBody_Base;

type FileDownloadRequestBodyParameter = keyof FileDownloadRequestBody;

export const FILE_DOWNLOAD_REQUEST_BODY_REQUIRED_PARAMETERS = ["fileCategory", "fileName", "downloadUrl"] as const satisfies FileDownloadRequestBodyParameter[];


export type FileUploadRequestBody = {
	file: string;	// base64 encoded file
} & PutRequestBody_Base;

type FileUploadRequestBodyParameter = keyof FileUploadRequestBody;

export const FILE_UPLOAD_REQUEST_BODY_REQUIRED_PARAMETERS = ["fileCategory", "fileName", "file"] as const satisfies FileUploadRequestBodyParameter[];


export type FileDeletionRequestBody = {
	fileNames: [string, ...string[]];	// non-empty string array
} & RequestBody_Base;

type FileDeletionRequestBodyParameter = keyof FileDeletionRequestBody;

export const FILE_DELETION_REQUEST_BODY_REQUIRED_PARAMETERS = ["fileCategory", "fileNames"] as const satisfies FileDeletionRequestBodyParameter[];