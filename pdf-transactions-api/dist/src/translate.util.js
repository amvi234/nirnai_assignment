"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = translateText;
const translate = require('@vitalets/google-translate-api');
async function translateText(text) {
    const res = await translate(text, { from: 'ta', to: 'en' });
    return res.text;
}
//# sourceMappingURL=translate.util.js.map