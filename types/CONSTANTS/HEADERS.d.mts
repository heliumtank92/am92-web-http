export default HEADERS;
declare namespace HEADERS {
    namespace REQ {
        const SESSION_ID: string;
        const REQUEST_ID: string;
        const API_KEY: string;
        const ACCESS_TOKEN: string;
        const ENCRYPTION_KEY: string;
        const CLIENT_ID: string;
    }
    namespace RES {
        const ACCESS_TOKEN_1: string;
        export { ACCESS_TOKEN_1 as ACCESS_TOKEN };
        export const REFRESH_TOKEN: string;
    }
}
