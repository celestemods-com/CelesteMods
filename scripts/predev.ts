import { validateAllDirectories } from "./helperFunctions/validateAllDirectories/validateAllDirectories";




const preDev = async () => {
    await validateAllDirectories();
};




preDev()
    .catch(console.error);