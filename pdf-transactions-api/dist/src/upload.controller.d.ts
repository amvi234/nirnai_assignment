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
    uploadPDF(file: Express.Multer.File, queryParams: {
        buyer?: string;
        seller?: string;
        houseNo?: string;
        surveyNo?: string;
        documentNo?: string;
    }): Promise<{
        status: string;
        message: string;
        data: any[];
        debug: {
            parsedCount: number;
            translatedCount: number;
            filteredCount: number;
            queryParams?: undefined;
        };
    } | {
        status: string;
        message: string;
        data: import("./upload.service").Transaction[];
        debug: {
            parsedCount: number;
            translatedCount: number;
            filteredCount: number;
            queryParams: {
                buyer?: string;
                seller?: string;
                houseNo?: string;
                surveyNo?: string;
                documentNo?: string;
            };
        };
    }>;
}
