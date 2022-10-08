import { ResponseStatus } from "../src/schema/types";

export default class Response {
    status: ResponseStatus = ResponseStatus.Success;
    data: any;
    static success(data?: any): Response {
        return {
            status: ResponseStatus.Success,
            data,
        };
    }
    static error(data?: any): Response {
        return {
            status: ResponseStatus.Failure,
            data,
        };
    }
}
