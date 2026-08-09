'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BrainCircuit, CheckCircle2, Clock3, ExternalLink, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { approveMaestroProposal, getMaestroProposals, rejectMaestroAction } from './actions';

type Proposal = {
  id: string; actionType: string; payload: unknown; confidenceScore: string | null; aiReasoning: string | null;
  status: string; executionStatus: string; reviewerNotes: string | null; resultEntityType: string | null;
  resultEntityId: string | null; createdAt: Date;
};

const labels: Record<string, string> = { draft_invoice: 'Чернова на фактура', draft_expense: 'Чернова на разход', draft_purchase_order: 'Чернова на purchase order' };

function resultHref(proposal: Proposal) {
  if (!proposal.resultEntityId) return null;
  if (proposal.resultEntityType === 'invoice') return `/dashboard/invoices/${proposal.resultEntityId}`;
  if (proposal.resultEntityType === 'expense') return '/dashboard/expenses';
  if (proposal.resultEntityType === 'purchase_order') return '/dashboard/inventory/purchase-orders';
  return null;
}

export default function MaestroApprovalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getMaestroProposals();
    if (result.success) setProposals((result.data || []) as Proposal[]); else setError(result.error || 'Неуспешно зареждане');
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function approve(id: string) {
    if (!confirm('Одобрявате ли създаването на тази чернова? Операцията ще бъде записана в audit log.')) return;
    setBusyId(id); setError(null);
    const result = await approveMaestroProposal(id);
    if (!result.success) setError(result.error || 'Изпълнението не успя');
    await refresh(); setBusyId(null);
  }

  async function reject(id: string) {
    const notes = prompt('Причина за отказа:');
    if (!notes) return;
    setBusyId(id); setError(null);
    const result = await rejectMaestroAction(id, notes);
    if (!result.success) setError(result.error || 'Отказът не беше записан');
    await refresh(); setBusyId(null);
  }

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/dashboard/ai-maestro" className="mb-3 flex items-center gap-1 text-sm font-bold text-amber-700"><ArrowLeft size={15} /> Maestro</Link><h1 className="flex items-center gap-2 text-3xl font-black"><ShieldCheck className="text-emerald-600" /> Maestro Approvals</h1><p className="mt-1 text-sm text-stone-600">Човешки контрол преди всяка промяна на бизнес запис</p></div><div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">RBAC + atomic execution + audit log</div></header>
    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">{error}</div>}
    {loading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div> : proposals.length === 0 ? <div className="rounded-3xl border border-stone-200 bg-white p-16 text-center"><BrainCircuit className="mx-auto mb-4 text-amber-500" size={48} /><h2 className="text-xl font-black">Няма предложения</h2><p className="mt-2 text-sm text-stone-600">Поискайте от Maestro да подготви чернова на фактура, разход или purchase order.</p></div> : <div className="space-y-4">{proposals.map((proposal) => {
      const href = resultHref(proposal); const payload = proposal.payload as Record<string, unknown>;
      return <article key={proposal.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">{labels[proposal.actionType] || proposal.actionType}</span><span className={`rounded-full px-3 py-1 text-xs font-black ${proposal.status === 'pending' ? 'bg-blue-100 text-blue-800' : proposal.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{proposal.status} · {proposal.executionStatus}</span><span className="flex items-center gap-1 text-xs text-stone-500"><Clock3 size={12} />{new Date(proposal.createdAt).toLocaleString()}</span></div><h2 className="mt-4 text-lg font-black">{String(payload.clientName || payload.description || payload.supplierName || 'Maestro proposal')}</h2><pre className="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-emerald-300">{JSON.stringify(payload, null, 2)}</pre>{proposal.aiReasoning && <p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm leading-6 text-stone-700"><strong>Причина:</strong> {proposal.aiReasoning}</p>}<p className="mt-2 text-xs font-bold text-stone-500">AI confidence: {proposal.confidenceScore || '—'}%</p>{proposal.reviewerNotes && <p className="mt-2 text-xs text-stone-600">Reviewer: {proposal.reviewerNotes}</p>}</div><div className="flex shrink-0 gap-2 lg:flex-col">{proposal.status === 'pending' && <><button disabled={busyId === proposal.id} onClick={() => void approve(proposal.id)} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-40"><CheckCircle2 size={17} /> Одобри и изпълни</button><button disabled={busyId === proposal.id} onClick={() => void reject(proposal.id)} className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 font-bold text-rose-700 disabled:opacity-40"><XCircle size={17} /> Откажи</button></>}{href && <Link href={href} className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 font-bold"><ExternalLink size={17} /> Отвори резултата</Link>}</div></div></article>;
    })}</div>}
  </div>;
}
