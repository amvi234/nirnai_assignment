import {
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  Query,
  BadRequestException,
  HttpStatus,
  HttpException,
  Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload') // Changed from 'api' to 'upload'
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // Add a GET endpoint for testing
  @Get()
  getUploadInfo() {
    return {
      message: 'Upload endpoint is working',
      method: 'POST',
      endpoint: '/api/upload',
      contentType: 'multipart/form-data',
      fileField: 'file'
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadPDF(
    @UploadedFile() file: Express.Multer.File,
    @Query() queryParams: any,
  ) {
    // Add file validation
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
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
    } catch (error) {
      console.error('Upload error:', error);
      throw new HttpException(
        'Failed to process PDF',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
