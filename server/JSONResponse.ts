export default class JSONResponse {
    status: "success" | "error" = "success";
    data: any;
    static success(data?: any): JSONResponse {
        return {
            status: "success",
            data,
        };
    }
    static error(data?: any): JSONResponse {
        return {
            status: "error",
            data,
        };
    }
}
