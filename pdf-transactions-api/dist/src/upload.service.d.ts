export declare class UploadService {
    processPDF(fileBuffer: Buffer, queryParams: any): Promise<{
        size: number;
        queryParams: any;
        processed: boolean;
        timestamp: string;
    }>;
}
