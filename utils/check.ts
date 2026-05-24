
    export const checkUserIfNotExist = async (user: any) => {
    // TODO: Check if user exists
     if (!user) {
        const error: any = new Error("User not found");
        error.statusCode = 404;
        throw error;
     }
}

export const checkfileIfNotExists = async (image: any) => {
    // TODO: Check if file exists
     if (!image) {
        const error: any = new Error("File not found");
        error.statusCode = 409;
        throw error;
     }
}
