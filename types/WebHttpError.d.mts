export default class WebHttpError extends Error {
    constructor(e: {}, eMap: any);
    _isCustomError: boolean;
    _isWebHttpError: boolean;
    message: any;
    statusCode: any;
    errorCode: any;
    data: any;
    error: {};
}
