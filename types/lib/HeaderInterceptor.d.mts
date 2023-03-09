export default HeaderInterceptor;
declare namespace HeaderInterceptor {
    const request: (typeof requestSuccess)[];
    const response: (typeof responseSuccess)[];
}
declare function requestSuccess(config: any): any;
declare function responseSuccess(response: any): any;
