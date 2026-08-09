import { createHash } from 'node:crypto';
import { and, desc, eq, or } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { auditLogs } from '@/lib/db/schema/audit_logs';
import { maestroMemories } from '@/lib/db/schema/ai_orchestration';

export type MemoryScope = 'user' | 'company';

function memoryFingerprint(tenantId: string, ownerUserId: string | null, scope: MemoryScope, key: string) {
  return createHash('sha256').update(JSON.stringify({ tenantId, ownerUserId, scope, key: key.trim().toLowerCase() })).digest('hex');
}

export async function loadMaestroMemory(tenantId: string, userId: string) {
  return db.select({ id: maestroMemories.id, scope: maestroMemories.scope, category: maestroMemories.category,
    memoryKey: maestroMemories.memoryKey, value: maestroMemories.value, updatedAt: maestroMemories.updatedAt })
    .from(maestroMemories).where(and(eq(maestroMemories.tenantId, tenantId), eq(maestroMemories.status, 'active'),
      or(eq(maestroMemories.scope, 'company'), and(eq(maestroMemories.scope, 'user'), eq(maestroMemories.ownerUserId, userId)))))
    .orderBy(desc(maestroMemories.updatedAt)).limit(30);
}

export async function saveMaestroMemory(input: { tenantId: string; userId: string; scope: MemoryScope; category: string; key: string; value: string }) {
  const ownerUserId = input.scope === 'user' ? input.userId : null;
  const fingerprint = memoryFingerprint(input.tenantId, ownerUserId, input.scope, input.key);
  const [memory] = await db.insert(maestroMemories).values({ tenantId: input.tenantId, ownerUserId, scope: input.scope,
    category: input.category, memoryKey: input.key, value: input.value, fingerprint, createdByUserId: input.userId })
    .onConflictDoUpdate({ target: [maestroMemories.tenantId, maestroMemories.fingerprint], set: {
      value: input.value, category: input.category, status: 'active', updatedAt: new Date(), createdByUserId: input.userId,
    } }).returning();
  await db.insert(auditLogs).values({ tenantId: input.tenantId, userId: input.userId, entityType: 'maestro_memory', entityId: memory.id,
    action: 'AI_MEMORY_SAVE', newValues: { scope: input.scope, category: input.category, key: input.key } });
  return memory;
}

export async function deleteMaestroMemory(input: { tenantId: string; userId: string; memoryId: string; canManageCompany: boolean }) {
  const ownership = input.canManageCompany
    ? or(eq(maestroMemories.ownerUserId, input.userId), eq(maestroMemories.scope, 'company'))
    : eq(maestroMemories.ownerUserId, input.userId);
  const [memory] = await db.update(maestroMemories).set({ status: 'deleted', updatedAt: new Date() })
    .where(and(eq(maestroMemories.id, input.memoryId), eq(maestroMemories.tenantId, input.tenantId),
      ownership)).returning();
  if (!memory) throw new Error('Memory not found.');
  await db.insert(auditLogs).values({ tenantId: input.tenantId, userId: input.userId, entityType: 'maestro_memory', entityId: memory.id,
    action: 'AI_MEMORY_DELETE', oldValues: { status: 'active' }, newValues: { status: 'deleted' } });
  return memory;
}

export function formatMemoryContext(memories: Array<{ scope: string; category: string; memoryKey: string; value: string }>) {
  if (!memories.length) return 'No explicit company or user memories are stored.';
  return memories.map((memory) => `- [${memory.scope}/${memory.category}] ${memory.memoryKey}: ${memory.value}`).join('\n');
}
