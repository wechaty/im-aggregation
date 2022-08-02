export default class Storage {
    constructor() { }
    /**
     * 
     * @param filePath 文件路径
     * @returns 远程文件路径
     */
    async upload(filePath: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
