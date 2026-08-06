import { pgTable, uuid, varchar, text, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const aiApprovals = pgTable('ai_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  
  // The action Maestro AI wants to perform
  actionType: varchar('action_type', { length: 50 }).notNull(), // e.g., 'bulk_expense_categorization', 'tax_adjustment', 'invoice_generation'
  
  // The actual payload/data for the action
  payload: jsonb('payload').notNull(),
  
  // The AI's confidence in its decision (0.00 to 100.00)
  confidenceScore: numeric('confidence_score', { precision: 5, scale: 2 }),
  
  // Explanation provided by the AI for why this action is recommended
  aiReasoning: text('ai_reasoning'),
  
  // Status of the approval
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, approved, rejected, modified
  
  // Who reviewed it (could be null until reviewed)
  humanReviewerId: varchar('human_reviewer_id', { length: 255 }),
  reviewedAt: timestamp('reviewed_at'),
  
  // Notes from the human reviewer
  reviewerNotes: text('reviewer_notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
