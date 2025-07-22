"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.transactions = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    buyer: (0, pg_core_1.varchar)('buyer', { length: 255 }),
    seller: (0, pg_core_1.varchar)('seller', { length: 255 }),
    houseNo: (0, pg_core_1.varchar)('house_no', { length: 50 }),
    surveyNo: (0, pg_core_1.varchar)('survey_no', { length: 100 }),
    documentNo: (0, pg_core_1.varchar)('document_no', { length: 100 }),
    date: (0, pg_core_1.date)('date'),
    value: (0, pg_core_1.varchar)('value', { length: 100 }),
});
//# sourceMappingURL=schema.js.map