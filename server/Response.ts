export default class Response {
    status: "success" | "error" = "success";
    data: any;
    static success(data?: any): Response {
        return {
            status: "success",
            data,
        };
    }
    static error(data?: any): Response {
        return {
            status: "error",
            data,
        };
    }
}
