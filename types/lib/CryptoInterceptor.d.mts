export default CryptoInterceptor;
declare namespace CryptoInterceptor {
    const request: (typeof requestSuccess)[];
    const response: (typeof responseSuccess)[];
}
declare function requestSuccess(config: any): Promise<any>;
declare function responseSuccess(response: any): Promise<any>;
