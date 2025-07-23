"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const pdfParse = __importStar(require("pdf-parse"));
const translate_1 = require("@google-cloud/translate");
let UploadService = class UploadService {
    constructor() {
        this.translateClient = new translate_1.v2.Translate();
    }
    async extractTransactions(buffer) {
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
            console.log('First 10 lines:');
            lines.slice(0, 10).forEach((line, index) => {
                console.log(`Line ${index + 1}: "${line}"`);
            });
            const transactions = [];
            let currentTxn = {};
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
                for (const pattern of patterns.buyer) {
                    if (line.includes(pattern)) {
                        currentTxn.buyer = this.extractFieldValue(line, pattern);
                        console.log(`Found buyer at line ${lineIndex}: "${currentTxn.buyer}"`);
                        fieldFound = true;
                        break;
                    }
                }
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
                if (this.isTransactionComplete(currentTxn)) {
                    console.log('Complete transaction found:', currentTxn);
                    transactions.push(currentTxn);
                    currentTxn = {};
                }
            }
            if (Object.keys(currentTxn).length > 0) {
                console.log('Partial transaction at end:', currentTxn);
                if (Object.keys(currentTxn).length >= 3) {
                    const completeTxn = {
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
        }
        catch (error) {
            console.error('Error in extractTransactions:', error);
            throw error;
        }
    }
    extractFieldValue(line, pattern) {
        let value = line.replace(pattern, '').replace(':', '').trim();
        if (!value) {
            const parts = line.split(/[:=\-]/);
            if (parts.length > 1) {
                value = parts[1].trim();
            }
        }
        return value;
    }
    isTransactionComplete(txn) {
        return !!(txn.buyer &&
            txn.seller &&
            txn.houseNo &&
            txn.surveyNo &&
            txn.documentNo &&
            txn.date &&
            txn.value);
    }
    async translateTransactions(transactions) {
        if (transactions.length === 0) {
            console.log('No transactions to translate');
            return [];
        }
        console.log(`Starting translation of ${transactions.length} transactions`);
        const translated = [];
        for (let i = 0; i < transactions.length; i++) {
            const txn = transactions[i];
            console.log(`Translating transaction ${i + 1}/${transactions.length}`);
            try {
                const [buyer, seller, houseNo, surveyNo, documentNo, date, value] = await Promise.all([
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
            }
            catch (err) {
                console.error(`Translation failed for transaction ${i + 1}:`, err);
                translated.push(txn);
            }
        }
        console.log(`Translation completed. ${translated.length} transactions processed`);
        return translated;
    }
    async translateText(text) {
        if (!text || text.trim().length === 0) {
            return text;
        }
        try {
            if (/^[a-zA-Z0-9\s\-.,/]+$/.test(text)) {
                return text;
            }
            const [translation] = await this.translateClient.translate(text, {
                from: 'ta',
                to: 'en'
            });
            return translation;
        }
        catch (error) {
            console.error('Translation error for text:', text, error);
            return text;
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map