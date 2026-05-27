
    export const checkUserIfNotExist = async (user: any) => {
    // TODO: Check if user exists
     if (!user) {
        const error: any = new Error("User not found");
        error.statusCode = 404;
        throw error;
     }
}
export const checkUploadFile = (file: any) => {
  if (!file) {
    const error: any = new Error("Invalid Image.");
    error.status = 409;
    error.code = "INVALID_IMAGE";
    throw error;
  }
};

export const checkModelIfExist = (model: any) => {
  if (!model) {
    const error: any = new Error("This model does not exist.");
    error.status = 409;
    error.code = "MODEL_NOT_FOUND";
    throw error;
  }
};

export const checkfileIfNotExists = async (image: any) => {
    // TODO: Check if file exists
     if (!image) {
        const error: any = new Error("File not found");
        error.statusCode = 409;
        throw error;
     }
}
