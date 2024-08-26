import path from "path";




/** Takes a file name and gives an absolute file path for a file with that name in `projectRoot/cache/` */
export const getFileSystemPath = (fileName: string) => {
    if (!fileName.endsWith(".json")) throw "The file name must end with '.json'.";


    const filePath = path.resolve("cache", fileName);
    // const filePath = path.resolve(process.cwd(),"cache", fileName);  // This is how Next.js recommends, but the above seems simpler and works fine. Apparently process.cwd() can behave differently in different environments?


    return filePath;
};