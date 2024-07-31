export const isStringArray = (value: unknown): value is string[] => {
    if (!Array.isArray(value)) {
        return false;
    }


    for (const element of value) {
        if (typeof element !== "string") {
            return false;
        }
    }

    
    return true;
};