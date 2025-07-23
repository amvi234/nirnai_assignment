"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const upload_service_1 = require("./upload.service");
let UploadController = class UploadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    getUploadInfo() {
        return {
            message: 'Upload endpoint is working',
            method: 'POST',
            endpoint: '/upload',
            contentType: 'multipart/form-data',
            fileField: 'file'
        };
    }
    async uploadPDF(file, queryParams) {
        console.log('=== UPLOAD ENDPOINT CALLED ===');
        console.log('Query params:', queryParams);
        if (!file) {
            console.log('ERROR: No file uploaded');
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (file.mimetype !== 'application/pdf') {
            console.log('ERROR: Invalid file type:', file.mimetype);
            throw new common_1.BadRequestException('Only PDF files are allowed');
        }
        try {
            console.log('File received:', {
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                bufferLength: file.buffer.length
            });
            console.log('=== STEP 1: EXTRACTING TRANSACTIONS ===');
            const parsedTransactions = await this.uploadService.extractTransactions(file.buffer);
            console.log(`Parsed transactions count: ${parsedTransactions.length}`);
            if (parsedTransactions.length === 0) {
                console.log('WARNING: No transactions found in PDF');
                return {
                    status: 'success',
                    message: 'PDF processed but no transactions found',
                    data: [],
                    debug: {
                        parsedCount: 0,
                        translatedCount: 0,
                        filteredCount: 0
                    }
                };
            }
            console.log('=== STEP 2: TRANSLATING TRANSACTIONS ===');
            const translatedTransactions = await this.uploadService.translateTransactions(parsedTransactions);
            console.log(`Translated transactions count: ${translatedTransactions.length}`);
            console.log('=== STEP 3: FILTERING TRANSACTIONS ===');
            let filteredTransactions = translatedTransactions;
            if (Object.keys(queryParams).some(key => queryParams[key])) {
                console.log('Applying filters:', queryParams);
                filteredTransactions = translatedTransactions.filter(txn => {
                    const buyerMatch = !queryParams.buyer ||
                        txn.buyer?.toLowerCase().includes(queryParams.buyer.toLowerCase());
                    const sellerMatch = !queryParams.seller ||
                        txn.seller?.toLowerCase().includes(queryParams.seller.toLowerCase());
                    const houseNoMatch = !queryParams.houseNo ||
                        txn.houseNo === queryParams.houseNo;
                    const surveyNoMatch = !queryParams.surveyNo ||
                        txn.surveyNo === queryParams.surveyNo;
                    const documentNoMatch = !queryParams.documentNo ||
                        txn.documentNo === queryParams.documentNo;
                    const matches = buyerMatch && sellerMatch && houseNoMatch && surveyNoMatch && documentNoMatch;
                    if (!matches) {
                        console.log('Transaction filtered out:', {
                            transaction: txn,
                            buyerMatch,
                            sellerMatch,
                            houseNoMatch,
                            surveyNoMatch,
                            documentNoMatch
                        });
                    }
                    return matches;
                });
            }
            console.log(`Filtered transactions count: ${filteredTransactions.length}`);
            console.log('=== FINAL RESULT ===');
            console.log('Returning data:', JSON.stringify(filteredTransactions, null, 2));
            return {
                status: 'success',
                message: 'PDF parsed and filtered successfully',
                data: filteredTransactions,
                debug: {
                    parsedCount: parsedTransactions.length,
                    translatedCount: translatedTransactions.length,
                    filteredCount: filteredTransactions.length,
                    queryParams: queryParams
                }
            };
        }
        catch (error) {
            console.error('=== UPLOAD ERROR ===');
            console.error('Error details:', error);
            console.error('Stack trace:', error.stack);
            throw new common_1.HttpException({
                message: 'Failed to process PDF',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "getUploadInfo", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadPDF", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map