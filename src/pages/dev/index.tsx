import { validComponentNames } from "./[component]";




export default function DevPage () {
    return `Valid component names are: ${validComponentNames.join(", ")}.`;
}