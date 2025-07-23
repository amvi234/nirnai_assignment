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

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get()
  getUploadInfo() {
    return {
      message: 'Upload endpoint is working',
      method: 'POST',
      endpoint: '/upload',
      contentType: 'multipart/form-data',
      fileField: 'file'
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadPDF(
    @UploadedFile() file: Express.Multer.File,
    @Query() queryParams: {
      buyer?: string;
      seller?: string;
      houseNo?: string;
      surveyNo?: string;
      documentNo?: string;
    }
  ) {
    console.log('=== UPLOAD ENDPOINT CALLED ===');
    console.log('Query params:', queryParams);

    if (!file) {
      console.log('ERROR: No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      console.log('ERROR: Invalid file type:', file.mimetype);
      throw new BadRequestException('Only PDF files are allowed');
    }

    try {
      console.log('File received:', {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        bufferLength: file.buffer.length
      });

      // Step 1: Parse Tamil PDF & extract fields
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

      // Step 2: Translate Tamil fields to English
      console.log('=== STEP 2: TRANSLATING TRANSACTIONS ===');
      const translatedTransactions = await this.uploadService.translateTransactions(parsedTransactions);
      console.log(`Translated transactions count: ${translatedTransactions.length}`);

      // Step 3: Filter based on query parameters
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
    } catch (error) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error.stack);
      
      throw new HttpException(
        {
          message: 'Failed to process PDF',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}