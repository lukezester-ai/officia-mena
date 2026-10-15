'use client';
import { useEffect, useState, useTransition } from 'react';
import { Archive, FileText, Loader2, Search, ShieldCheck, Upload } from 'lucide-react';
import { archiveKnowledgeDocument, getKnowledgeControlData } from './actions';

type Source = { id: string; fileName: string; title: string; version: number; status: string; visibility: string; allowedRoles: unknown; pageCount: number | null; createdAt: Date };
type Data = { sources: Source[]; metrics: { activeDocuments: number; retrievals: number; noResultRate: number; averageLatencyMs: number } };

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState('company');
  const [roles, setRoles] = useState(['admin', 'finance', 'manager']);
  const [data, setData] = useState<Data | null>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  const load = async () => {
    const result = await getKnowledgeControlData();
    if (result.success && result.data) {
      setData(result.data as Data);
    } else {
      setMessage(result.error || 'فشل التحميل.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = () => startTransition(async () => {
    if (!file) return;
    setMessage('جاري المعالجة، التقسيم، والتحليل…');
    const body = new FormData();
    body.append('file', file);
    body.append('visibility', visibility);
    body.append('allowedRoles', roles.join(','));
    const response = await fetch('/api/documents/upload', { method: 'POST', body });
    const result = await response.json();
    setMessage(response.ok ? `تم: v${result.version}, ${result.pages} صفحة, ${result.chunksCount} قطعة.` : result.error || 'فشل الرفع.');
    if (response.ok) {
      setFile(null);
      await load();
    }
  });

  const archive = (id: string) => startTransition(async () => {
    const result = await archiveKnowledgeDocument(id);
    if (!result.success) setMessage(result.error || 'فشل الأرشفة.');
    await load();
  });

  const toggleRole = (role: string) => setRoles(current => current.includes(role) ? current.filter(item => item !== role) : [...current, role]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-white">محرك المعرفة المؤسسي</h1>
        <p className="mt-1 text-zinc-400">إصدارات، التحكم في الوصول، البحث الهجين، الاقتباسات الدقيقة، وتحليلات الاسترجاع.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-4">
        {[
          ['الوثائق النشطة', data?.metrics.activeDocuments || 0, FileText],
          ['عمليات البحث', data?.metrics.retrievals || 0, Search],
          ['بدون نتائج', `${data?.metrics.noResultRate || 0}%`, ShieldCheck],
          ['متوسط زمن الاستجابة', `${data?.metrics.averageLatencyMs || 0} ms`, Loader2]
        ].map(([label, value, Icon]) => {
          const I = Icon as typeof FileText;
          return (
            <div key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <I className="text-emerald-400" />
              <p className="mt-2 text-xs font-bold text-zinc-500">{String(label)}</p>
              <p className="text-2xl font-black text-white">{String(value)}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-black text-white">رفع وثيقة PDF</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={event => setFile(event.target.files?.[0] || null)}
            className="rounded-xl border border-white/10 bg-black/30 p-3 text-white"
          />
          <select
            value={visibility}
            onChange={event => setVisibility(event.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 p-3 text-white"
          >
            <option value="company">الشركة بالكامل</option>
            <option value="restricted">وصول محدود</option>
          </select>
          <button
            disabled={!file || pending}
            onClick={upload}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary p-3 font-bold text-background disabled:opacity-40"
          >
            <Upload size={18} />
            رفع
          </button>
        </div>
        {visibility === 'restricted' && (
          <div className="mt-3 flex gap-3">
            {['admin', 'finance', 'manager', 'member'].map(role => (
              <label key={role} className="flex gap-1 text-sm text-white">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {role}
              </label>
            ))}
          </div>
        )}
        {message && <p className="mt-4 rounded-xl bg-white/[0.03] p-3 text-sm font-bold text-white">{message}</p>}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-black text-white">سجل الوثائق</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-right text-sm text-white">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3">الوثيقة</th>
                <th className="p-3">الإصدار</th>
                <th className="p-3">الصفحات</th>
                <th className="p-3">الوصول</th>
                <th className="p-3">الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.sources.map(source => (
                <tr key={source.id} className="border-b border-white/5 last:border-0">
                  <td className="p-3 font-bold">{source.title}</td>
                  <td className="p-3">v{source.version}</td>
                  <td className="p-3">{source.pageCount || '—'}</td>
                  <td className="p-3">{source.visibility}</td>
                  <td className="p-3">{source.status}</td>
                  <td className="p-3">
                    {source.status === 'active' && (
                      <button
                        disabled={pending}
                        onClick={() => archive(source.id)}
                        className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-2 text-rose-300"
                      >
                        <Archive size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
