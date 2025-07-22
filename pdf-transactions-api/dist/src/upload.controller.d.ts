import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    getUploadInfo(): {
        message: string;
        method: string;
        endpoint: string;
        contentType: string;
        fileField: string;
    };
    uploadPDF(file: Express.Multer.File, queryParams: any): Promise<{
        status: string;
        message: string;
        data: {
            size: number;
            queryParams: any;
            processed: boolean;
            timestamp: string;
        };
    }>;
}
