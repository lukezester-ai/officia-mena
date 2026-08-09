'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { BellRing, CheckCircle2, Clock3, ExternalLink, Radar } from 'lucide-react';
import { getMaestroInbox, resolveMaestroAlert, runMaestroScan, snoozeMaestroAlert } from './actions';

type InboxItem = { id: string; type: string; title: string; description: string; priority: string | null; status: string | null;
  metaJson: unknown; detectedAt: Date | null; snoozedUntil: Date | null };

export default function MaestroInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const load = async () => { const result = await getMaestroInbox(); if (result.success) setItems((result.data || []) as InboxItem[]); else setError(result.error || 'Load failed.'); };
  useEffect(() => { void load(); }, []);
  const perform = (work: () => Promise<{ success: boolean; error?: string; data?: { detected: number; autoResolved: number } }>) => startTransition(async () => {
    setError(''); const result = await work();
    if (!result.success) setError(result.error || 'Action failed.');
    else { if (result.data) setMessage(`Открити: ${result.data.detected}; автоматично приключени: ${result.data.autoResolved}.`); await load(); }
  });
  const priorityClass = (priority: string | null) => priority === 'critical' ? 'bg-rose-100 text-rose-800' : priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800';

  return <main className="min-h-screen bg-stone-50 p-5 text-stone-950 md:p-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><Link href="/dashboard/ai-maestro" className="text-sm font-bold text-emerald-700">← Maestro</Link><h1 className="mt-2 text-3xl font-black">Проактивен inbox</h1><p className="mt-1 text-stone-600">Финансови, регулаторни, HR и складови рискове с човешки контрол.</p></div><button disabled={pending} onClick={() => perform(runMaestroScan)} className="flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 font-black text-white disabled:opacity-50"><Radar size={18} /> Сканирай сега</button></div>
    {error && <p className="mt-5 rounded-2xl bg-rose-100 p-4 font-bold text-rose-800">{error}</p>}{message && <p className="mt-5 rounded-2xl bg-emerald-100 p-4 font-bold text-emerald-800">{message}</p>}
    <div className="mt-7 grid gap-4">{items.length ? items.map((item) => { const meta = (item.metaJson && typeof item.metaJson === 'object' ? item.metaJson : {}) as Record<string, unknown>; const href = typeof meta.href === 'string' ? meta.href : null; return <article key={item.id} className={`rounded-3xl border bg-white p-5 shadow-sm ${item.status === 'resolved' ? 'opacity-60' : ''}`}><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${priorityClass(item.priority)}`}>{item.priority}</span><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black">{item.status}</span><span className="rounded-full bg-stone-100 px-3 py-1 text-xs">{item.type}</span></div><h2 className="mt-3 text-lg font-black">{item.title}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>{item.detectedAt && <p className="mt-2 text-xs text-stone-400">Последно открит: {new Date(item.detectedAt).toLocaleString()}</p>}</div><div className="flex flex-wrap gap-2">{href && <Link href={href} className="flex items-center gap-2 rounded-xl border px-4 py-2 font-bold"><ExternalLink size={16} /> Източник</Link>}{item.status !== 'resolved' && <><button disabled={pending} onClick={() => perform(() => snoozeMaestroAlert(item.id, 7))} className="flex items-center gap-2 rounded-xl border px-4 py-2 font-bold"><Clock3 size={16} /> 7 дни</button><button disabled={pending} onClick={() => perform(() => resolveMaestroAlert(item.id))} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white"><CheckCircle2 size={16} /> Приключи</button></>}</div></div></article>; }) : <div className="rounded-3xl border border-dashed bg-white p-12 text-center"><BellRing className="mx-auto text-emerald-600" /><p className="mt-3 font-black">Няма сигнали. Стартирайте първото сканиране.</p></div>}</div>
  </div></main>;
}
