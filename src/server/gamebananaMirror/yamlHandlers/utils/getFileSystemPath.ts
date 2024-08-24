import path from "path";




export const getFileSystemPath = (fileName: string) => {
    if (!fileName.endsWith(".json")) throw "The file name must end with '.json'.";


    const filePath = path.resolve("~/../cache", fileName);
    // const filePath = path.resolve(process.cwd(),"cache", fileName);


    return filePath;
};