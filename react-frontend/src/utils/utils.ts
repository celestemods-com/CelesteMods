export const getCurrentTime = () => {
    return Math.floor(new Date().getTime() / 1000);
}




export const getAverage = (numbers: number[]) => {
    if (!numbers.length) return;

    const sum = numbers.reduce((sum, number) => sum + number, 0);

    return sum / numbers.length;
}