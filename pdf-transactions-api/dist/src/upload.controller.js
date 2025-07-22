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
            endpoint: '/api/upload',
            contentType: 'multipart/form-data',
            fileField: 'file'
        };
    }
    async uploadPDF(file, queryParams) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Only PDF files are allowed');
        }
        try {
            console.log('File received:', {
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            });
            const result = await this.uploadService.processPDF(file.buffer, queryParams);
            return {
                status: 'success',
                message: 'File uploaded successfully',
                data: result
            };
        }
        catch (error) {
            console.error('Upload error:', error);
            throw new common_1.HttpException('Failed to process PDF', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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