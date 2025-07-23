import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { v2 as Translate } from '@google-cloud/translate';

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
  private translateClient = new Translate.Translate();

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
    if (transactions.length === 0) {
      console.log('No transactions to translate');
      return [];
    }

    console.log(`Starting translation of ${transactions.length} transactions`);
    const translated: Transaction[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const txn = transactions[i];
      console.log(`Translating transaction ${i + 1}/${transactions.length}`);
      
      try {
        const [buyer, seller, houseNo, surveyNo, documentNo, date, value] =
          await Promise.all([
            this.translateText(txn.buyer),
            this.translateText(txn.seller),
            this.translateText(txn.houseNo),
            this.translateText(txn.surveyNo),
            this.translateText(txn.documentNo),
            this.translateText(txn.date),
            this.translateText(txn.value),
          ]);

        translated.push({
          buyer,
          seller,
          houseNo,
          surveyNo,
          documentNo,
          date,
          value
        });
        
        console.log(`Transaction ${i + 1} translated successfully`);
      } catch (err) {
        console.error(`Translation failed for transaction ${i + 1}:`, err);
        // Push original transaction if translation fails
        translated.push(txn);
      }
    }

    console.log(`Translation completed. ${translated.length} transactions processed`);
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

      const [translation] = await this.translateClient.translate(text, {
        from: 'ta',
        to: 'en'
      });
      return translation;
    } catch (error) {
      console.error('Translation error for text:', text, error);
      return text; // Return original text if translation fails
    }
  }
}