export default class WebHttp {
    constructor(CONFIG?: {}, webHttpConfig?: {
        disableCrypto: boolean;
        disableHeaderInjection: boolean;
    });
    webHttpConfig: {
        disableCrypto: boolean;
        disableHeaderInjection: boolean;
    };
    client: any;
    context: any;
    interceptors: any;
    request(options?: {}): any;
    _useDefaultInterceptors: () => void;
}
import CONTEXT from './CONSTANTS/CONTEXT.mjs';
import HEADERS from './CONSTANTS/HEADERS.mjs';
export { CONTEXT, HEADERS };
