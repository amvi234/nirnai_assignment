// db/schema.ts
import { pgTable, varchar, serial, date } from 'drizzle-orm/pg-core';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  buyer: varchar('buyer', { length: 255 }),
  seller: varchar('seller', { length: 255 }),
  houseNo: varchar('house_no', { length: 50 }),
  surveyNo: varchar('survey_no', { length: 100 }),
  documentNo: varchar('document_no', { length: 100 }),
  date: date('date'),
  value: varchar('value', { length: 100 }),
});
