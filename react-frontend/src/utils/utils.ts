//import { omit } from "lodash";




export const getCurrentTime = () => {
    return Math.floor(new Date().getTime() / 1000);
}




export const getAverage = (numbers: number[]) => {
    if (!numbers.length) return;

    const sum = numbers.reduce((sum, number) => sum + number, 0);

    return sum / numbers.length;
}




// export const isPlainObject = (item: unknown): item is Object => {
//     return (
//         typeof item === "object" &&
//         !Array.isArray(item) &&
//         item !== null
//     );
// }




// export const deepOmit = (removedProperty: string, item: unknown): unknown => {
//     if (isPlainObject(item)) {
//         return (
//             Object.fromEntries(
//                 Object.entries(
//                     omit(item, removedProperty)
//                 ).map(([key, property]) => {
//                     return [key, deepOmit(removedProperty, property)];
//                 })
//             )
//         );
//     }

//     return item;
// }