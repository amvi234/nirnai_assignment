import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { v2 as Translate } from '@google-cloud/translate';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface Transaction {
  buyer: string;
  seller: string;
  houseNo: string;
  surveyNo: string;
  documentNo: string;
  date: string;
  value: string;
}

@Injectable()
export class UploadService {
  private readonly googleTranslateUrl = 'https://translation.googleapis.com/language/translate/v2';
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_TRANSLATE_API_KEY');
  }


  /**
   * Extract transaction records from Tamil real estate PDF
   */
  async extractTransactions(buffer: Buffer): Promise<Transaction[]> {
    try {
      const pdfData = await pdfParse.default(buffer);
      const text = pdfData.text;

      console.log('=== PDF EXTRACTION DEBUG ===');
      console.log('PDF text length:', text.length);
      console.log('First 500 characters:', text.substring(0, 500));
      
      if (!text || text.trim().length === 0) {
        console.log('WARNING: PDF text is empty or null');
        return [];
      }

      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      console.log('Total non-empty lines:', lines.length);
      
      // Debug: Show first 10 lines to understand structure
      console.log('First 10 lines:');
      lines.slice(0, 10).forEach((line, index) => {
        console.log(`Line ${index + 1}: "${line}"`);
      });

      const transactions: Transaction[] = [];
      let currentTxn: Partial<Transaction> = {};
      
      // Enhanced pattern matching with multiple possible formats
      const patterns = {
        buyer: ['வாங்குபவர்', 'வாங்குபவர்:', 'Buyer', 'buyer'],
        seller: ['விற்பவர்', 'விற்பவர்:', 'Seller', 'seller'],
        houseNo: ['வீட்டு எண்', 'வீட்டு எண்:', 'House No', 'house no'],
        surveyNo: ['சர்வே எண்', 'சர்வே எண்:', 'Survey No', 'survey no'],
        documentNo: ['ஆவண எண்', 'ஆவண எண்:', 'Document No', 'document no'],
        date: ['தேதி', 'தேதி:', 'Date', 'date'],
        value: ['மதிப்பு', 'மதிப்பு:', 'Value', 'value', 'Amount', 'amount']
      };

      let lineIndex = 0;
      for (const line of lines) {
        lineIndex++;
        let fieldFound = false;

        // Check for buyer patterns
        for (const pattern of patterns.buyer) {
          if (line.includes(pattern)) {
            currentTxn.buyer = this.extractFieldValue(line, pattern);
            console.log(`Found buyer at line ${lineIndex}: "${currentTxn.buyer}"`);
            fieldFound = true;
            break;
          }
        }

        // Check for seller patterns
        if (!fieldFound) {
          for (const pattern of patterns.seller) {
            if (line.includes(pattern)) {
              currentTxn.seller = this.extractFieldValue(line, pattern);
              console.log(`Found seller at line ${lineIndex}: "${currentTxn.seller}"`);
              fieldFound = true;
              break;
            }
          }
        }

        // Check for house number patterns
        if (!fieldFound) {
          for (const pattern of patterns.houseNo) {
            if (line.includes(pattern)) {
              currentTxn.houseNo = this.extractFieldValue(line, pattern);
              console.log(`Found houseNo at line ${lineIndex}: "${currentTxn.houseNo}"`);
              fieldFound = true;
              break;
            }
          }
        }

        // Check for survey number patterns
        if (!fieldFound) {
          for (const pattern of patterns.surveyNo) {
            if (line.includes(pattern)) {
              currentTxn.surveyNo = this.extractFieldValue(line, pattern);
              console.log(`Found surveyNo at line ${lineIndex}: "${currentTxn.surveyNo}"`);
              fieldFound = true;
              break;
            }
          }
        }

        // Check for document number patterns
        if (!fieldFound) {
          for (const pattern of patterns.documentNo) {
            if (line.includes(pattern)) {
              currentTxn.documentNo = this.extractFieldValue(line, pattern);
              console.log(`Found documentNo at line ${lineIndex}: "${currentTxn.documentNo}"`);
              fieldFound = true;
              break;
            }
          }
        }

        // Check for date patterns
        if (!fieldFound) {
          for (const pattern of patterns.date) {
            if (line.includes(pattern)) {
              currentTxn.date = this.extractFieldValue(line, pattern);
              console.log(`Found date at line ${lineIndex}: "${currentTxn.date}"`);
              fieldFound = true;
              break;
            }
          }
        }

        // Check for value patterns
        if (!fieldFound) {
          for (const pattern of patterns.value) {
            if (line.includes(pattern)) {
              currentTxn.value = this.extractFieldValue(line, pattern);
              console.log(`Found value at line ${lineIndex}: "${currentTxn.value}"`);
              fieldFound = true;
              break;
            }
          }
        }

        // Check if we have a complete transaction
        if (this.isTransactionComplete(currentTxn)) {
          console.log('Complete transaction found:', currentTxn);
          transactions.push(currentTxn as Transaction);
          currentTxn = {};
        }
      }

      // Check if there's a partial transaction at the end
      if (Object.keys(currentTxn).length > 0) {
        console.log('Partial transaction at end:', currentTxn);
        // If we have at least 3 fields, consider it valid
        if (Object.keys(currentTxn).length >= 3) {
          // Fill missing fields with empty strings
          const completeTxn: Transaction = {
            buyer: currentTxn.buyer || '',
            seller: currentTxn.seller || '',
            houseNo: currentTxn.houseNo || '',
            surveyNo: currentTxn.surveyNo || '',
            documentNo: currentTxn.documentNo || '',
            date: currentTxn.date || '',
            value: currentTxn.value || ''
          };
          transactions.push(completeTxn);
        }
      }

      console.log(`Total transactions extracted: ${transactions.length}`);
      console.log('Transactions:', JSON.stringify(transactions, null, 2));

      return transactions;
    } catch (error) {
      console.error('Error in extractTransactions:', error);
      throw error;
    }
  }

  /**
   * Extract field value from a line containing a pattern
   */
  private extractFieldValue(line: string, pattern: string): string {
    // Remove the pattern and any colons, then trim
    let value = line.replace(pattern, '').replace(':', '').trim();
    
    // If the value is empty, try to get the next part after splitting by common delimiters
    if (!value) {
      const parts = line.split(/[:=\-]/);
      if (parts.length > 1) {
        value = parts[1].trim();
      }
    }
    
    return value;
  }

  /**
   * Check if a transaction has all required fields
   */
  private isTransactionComplete(txn: Partial<Transaction>): boolean {
    return !!(
      txn.buyer &&
      txn.seller &&
      txn.houseNo &&
      txn.surveyNo &&
      txn.documentNo &&
      txn.date &&
      txn.value
    );
  }

  /**
   * Translate transactions using Google Cloud Translate
   */
  async translateTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (transactions.length === 0) return [];

    const translated: Transaction[] = [];
    for (const txn of transactions) {
      const translatedTxn: Transaction = {
        buyer: await this.translateText(txn.buyer),
        seller: await this.translateText(txn.seller),
        houseNo: await this.translateText(txn.houseNo),
        surveyNo: await this.translateText(txn.surveyNo),
        documentNo: await this.translateText(txn.documentNo),
        date: await this.translateText(txn.date),
        value: await this.translateText(txn.value),
      };
      translated.push(translatedTxn);
    }

    return translated;
  }

  /**
   * Helper method to translate a single text
   */
  private async translateText(text: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      return text;
    }

    try {
      // Skip translation if text appears to be already in English (contains only ASCII characters and common English words)
      if (/^[a-zA-Z0-9\s\-.,/]+$/.test(text)) {
        return text;
      }

      const response = await axios.post(
        `${this.googleTranslateUrl}?key=${this.apiKey}`,
        {
          q: text,
          source: 'ta',
          target: 'en',
          format: 'text',
        },
      );
      
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error for text:', text, error);
      return text; // Return original text if translation fails
    }
  }
}