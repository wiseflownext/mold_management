export declare class UploadService {
    private client;
    constructor();
    upload(file: Express.Multer.File, folder?: string): Promise<{
        url: any;
        key: string;
    }>;
}
