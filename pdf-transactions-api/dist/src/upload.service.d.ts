import { ConfigService } from '@nestjs/config';
export interface Transaction {
    buyer: string;
    seller: string;
    houseNo: string;
    surveyNo: string;
    documentNo: string;
    date: string;
    value: string;
}
export declare class UploadService {
    private readonly configService;
    private readonly googleTranslateUrl;
    private readonly apiKey;
    constructor(configService: ConfigService);
    extractTransactions(buffer: Buffer): Promise<Transaction[]>;
    private extractFieldValue;
    private isTransactionComplete;
    translateTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    private translateText;
}
