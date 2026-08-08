import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const stripeEvents = pgTable('stripe_events', {
  eventId: varchar('event_id', { length: 255 }).primaryKey(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
});
