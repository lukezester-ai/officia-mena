'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { Activity, BrainCircuit, Clock3, Database, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { getMaestroControlData, removeMaestroMemory } from './actions';

type ControlData = Awaited<ReturnType<typeof getMaestroControlData>> extends { data?: infer D } ? D : never;

export default function MaestroControlPage() {
  const [data, setData] = useState<NonNullable<ControlData> | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const load = async () => { const result = await getMaestroControlData(); if (result.success && result.data) setData(result.data); else setError(result.error || 'Load failed.'); };
  useEffect(() => { void load(); }, []);
  const remove = (id: string) => startTransition(async () => { const result = await removeMaestroMemory(id); if (!result.success) setError(result.error || 'Delete failed.'); else await load(); });
  const metrics = data?.metrics;
  return <main className="min-h-screen bg-stone-50 p-5 text-stone-950 md:p-8"><div className="mx-auto max-w-7xl">
    <div className="flex gap-4"><Link href="/dashboard/ai-maestro" className="text-sm font-bold text-emerald-700">← Maestro</Link><Link href="/dashboard/ai-maestro/integrations" className="text-sm font-bold text-violet-700">Integration Control</Link></div><h1 className="mt-2 text-3xl font-black">AI Control Center</h1><p className="mt-1 text-stone-600">Маршрутизация, надеждност и изрично запазена памет — без съдържанието на разговорите.</p>
    {error && <p className="mt-5 rounded-2xl bg-rose-100 p-4 font-bold text-rose-800">{error}</p>}
    <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[
      ['AI runs', metrics?.totalRuns ?? 0, BrainCircuit], ['Успеваемост', `${metrics?.successRate ?? 100}%`, ShieldCheck],
      ['Неуспешни', metrics?.failedRuns ?? 0, Activity], ['Средна латентност', `${metrics?.averageLatencyMs ?? 0} ms`, Clock3],
      ['Tokens', metrics?.totalTokens ?? 0, Database],
      ['AI eval', `${metrics?.averageEvaluation ?? 0}/100`, ShieldCheck], ['Fallback runs', metrics?.fallbackRuns ?? 0, RefreshCw],
    ].map(([label, value, Icon]) => { const MetricIcon = Icon as typeof BrainCircuit; return <div key={String(label)} className="rounded-3xl border bg-white p-5 shadow-sm"><MetricIcon size={20} className="text-emerald-600"/><p className="mt-3 text-xs font-bold uppercase text-stone-500">{String(label)}</p><p className="mt-1 text-2xl font-black">{String(value)}</p></div>; })}</section>
    <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_420px]"><section className="rounded-3xl border bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Последни AI runs</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-stone-500"><th className="p-3">Експерт</th><th className="p-3">Намерение</th><th className="p-3">Статус</th><th className="p-3">Време</th><th className="p-3">Tokens</th></tr></thead><tbody>{data?.runs.map((run) => <tr key={run.id} className="border-b last:border-0"><td className="p-3 font-bold">{run.specialist}</td><td className="p-3">{run.intent}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-black ${run.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : run.status === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{run.status}</span></td><td className="p-3">{run.latencyMs ?? '—'} ms</td><td className="p-3">{run.totalTokens ?? '—'}</td></tr>)}</tbody></table></div></section>
    <aside className="rounded-3xl border bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Изрична памет</h2><p className="mt-1 text-xs text-stone-500">Maestro не записва нищо мълчаливо. Кажете „Запомни…“ в чата.</p><div className="mt-4 space-y-3">{data?.memories.length ? data.memories.map((memory) => <div key={memory.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black uppercase text-blue-800">{memory.scope} · {memory.category}</span><h3 className="mt-2 font-black">{memory.memoryKey}</h3><p className="mt-1 text-sm text-stone-600">{memory.value}</p></div><button disabled={pending} onClick={() => remove(memory.id)} aria-label="Изтрий памет" className="rounded-xl border p-2 text-rose-700"><Trash2 size={16}/></button></div></div>) : <p className="rounded-2xl bg-stone-50 p-4 text-sm font-bold text-stone-600">Няма запазена памет.</p>}</div></aside></div>
  </div></main>;
}
