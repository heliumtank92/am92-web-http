export default class WebHttp {
    constructor(CONFIG?: {}, webHttpConfig?: {});
    webHttpConfig: {};
    client: import("axios").AxiosInstance;
    context: Map<string, any>;
    interceptors: {
        request: import("axios").AxiosInterceptorManager<import("axios").InternalAxiosRequestConfig<any>>;
        response: import("axios").AxiosInterceptorManager<import("axios").AxiosResponse<any, any>>;
    };
    request(options?: {}): any;
    #private;
}
import CONTEXT from "./CONSTANTS/CONTEXT.mjs";
import HEADERS from "./CONSTANTS/HEADERS.mjs";
export { CONTEXT, HEADERS };
