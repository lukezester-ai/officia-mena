'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, BrainCircuit, Clock3, Database, Send, ShieldCheck, Sparkles, User } from 'lucide-react';

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };
type Briefing = {
  company: { name: string; country: string | null };
  generatedAt: string;
  metrics: { revenue: string; netIncome: string; cash: string; receivables: string; payables: string; vat: string; controlIssues: number };
  alerts: Array<{ id: string; title: string; description: string; priority: string | null; confidence: string | null }>;
  sources: Array<{ label: string; href: string }>;
};

const prompts = [
  'أعطني نظرة مالية شاملة مع المصادر.',
  'ما الفواتير المتأخرة وما إجمالي المخاطر؟',
  'تحقق من مخاطر المخزون والامتثال التنظيمي.',
  'هل توجد إقامات أو مستندات موارد بشرية قاربت على الانتهاء؟',
];

function metricLabel(key: keyof Briefing['metrics']) {
  return ({ revenue: 'الإيرادات', netIncome: 'صافي الدخل', cash: 'النقد', receivables: 'الذمم المدينة', payables: 'الذمم الدائنة', vat: 'صافي الضريبة', controlIssues: 'تنبيهات الرقابة' })[key];
}

export default function AiMaestroPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const chatAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    fetch('/api/maestro/briefing', { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Briefing unavailable');
      const data = await response.json();
      if (mountedRef.current) setBriefing(data);
    }).catch((caught) => {
      if (mountedRef.current && !(caught instanceof DOMException && caught.name === 'AbortError')) setBriefing(null);
    });

    return () => {
      mountedRef.current = false;
      controller.abort();
      chatAbortRef.current?.abort();
      chatAbortRef.current = null;
    };
  }, []);

  useEffect(() => {
    const target = messagesEndRef.current;
    if (target && typeof target.scrollIntoView === 'function') target.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function ask(content: string) {
    if (!content.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: content.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    chatAbortRef.current?.abort();
    const controller = new AbortController();
    chatAbortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content: text }) => ({ role, content: text })) }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `تعذر على Maestro إكمال الطلب (${response.status})`);
      }
      if (!response.body) throw new Error('لم يُرجع Maestro استجابة');

      const assistantId = crypto.randomUUID();
      if (!mountedRef.current) return;
      setMessages((current) => [...current, { id: assistantId, role: 'assistant', content: '' }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffered = '';
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!mountedRef.current) {
          await reader.cancel();
          break;
        }
        buffered += decoder.decode(value, { stream: true });
        const lines = buffered.split('\n');
        buffered = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('0:')) continue;
          try { answer += JSON.parse(line.slice(2)); } catch { /* wait for the next complete frame */ }
        }
        if (mountedRef.current) setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, content: answer } : message));
      }
    } catch (caught) {
      const aborted = caught instanceof DOMException && caught.name === 'AbortError';
      if (mountedRef.current && !aborted) setError(caught instanceof Error ? caught.message : 'حدث خطأ غير متوقع في Maestro');
    } finally {
      if (chatAbortRef.current === controller) chatAbortRef.current = null;
      if (mountedRef.current) setIsLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6" dir="rtl">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-amber-300/40 bg-black p-3 text-amber-400"><BrainCircuit size={32} /></div>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black text-[var(--color-desert-900)]">Maestro <Sparkles size={18} className="text-amber-500" /></h1>
            <p className="text-sm text-[var(--color-desert-600)]">مساعد أعمال موثوق ومعزول لكل شركة · وضع القراءة فقط</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Link href="/dashboard/ai-maestro/control" className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-900">مركز تحكم الذكاء الاصطناعي</Link><Link href="/dashboard/ai-maestro/inbox" className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-900">صندوق التنبيهات الاستباقية</Link><Link href="/dashboard/ai-maestro/approvals" className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">مراجعة المقترحات</Link><div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800"><ShieldCheck size={16} /> لا تتغير البيانات دون موافقة</div></div>
      </header>

      {briefing && (
        <section className="rounded-3xl border border-[var(--color-desert-200)] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="text-lg font-black text-[var(--color-desert-900)]">الملخص التشغيلي · {briefing.company.name}</h2><p className="text-xs text-[var(--color-desert-500)]">محسوب مباشرة من السجلات المحاسبية</p></div>
            <span className="flex items-center gap-1 text-xs text-[var(--color-desert-500)]"><Clock3 size={13} /> {new Date(briefing.generatedAt).toLocaleString()}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {(Object.entries(briefing.metrics) as Array<[keyof Briefing['metrics'], string | number]>).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-[var(--color-desert-100)] bg-[var(--color-desert-50)] p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-desert-500)]">{metricLabel(key)}</div>
                <div className="mt-2 text-lg font-black text-[var(--color-desert-900)]">{value}{key !== 'controlIssues' ? ' SAR' : ''}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs"><Database size={14} className="text-emerald-600" />{briefing.sources.map((source) => <Link key={source.href} href={source.href} className="font-bold text-emerald-700 hover:underline">{source.label}</Link>)}</div>
        </section>
      )}

      <div className="grid min-h-[620px] gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex min-h-[620px] flex-col overflow-hidden rounded-3xl border border-[var(--color-desert-200)] bg-white shadow-sm">
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {messages.length === 0 && <div className="flex h-full flex-col items-center justify-center gap-6 text-center"><BrainCircuit size={58} className="text-amber-500" /><div><h2 className="text-2xl font-black">ما الذي تريد التحقق منه؟</h2><p className="mt-2 max-w-lg text-sm text-[var(--color-desert-600)]">سيستخدم Maestro سجلات الشركة الفعلية ويذكر المصادر. عند عدم توفر بيانات، لن يختلق نتائج.</p></div><div className="flex max-w-2xl flex-wrap justify-center gap-2">{prompts.map((prompt) => <button key={prompt} onClick={() => void ask(prompt)} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100">{prompt}</button>)}</div></div>}
            {messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${message.role === 'user' ? 'bg-stone-200' : 'bg-black text-amber-400'}`}>{message.role === 'user' ? <User size={18} /> : <BrainCircuit size={18} />}</div><div className={`max-w-[84%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-7 ${message.role === 'user' ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-stone-50 text-stone-900'}`}>{message.content || 'جارٍ التحقق من المصادر…'}</div></div>)}
            {isLoading && !messages.some((message) => message.role === 'assistant' && !message.content) && <div className="text-sm font-bold text-amber-700">يحلل Maestro البيانات القابلة للتحقق…</div>}
            <div ref={messagesEndRef} />
          </div>
          {error && <div className="mx-5 mb-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} />{error}</div>}
          <form onSubmit={submit} className="flex gap-3 border-t border-stone-200 p-4"><input value={input} onChange={(event) => setInput(event.target.value)} maxLength={20000} placeholder="اسأل عن المالية أو الفواتير أو المخزون أو الموارد البشرية أو المستندات…" className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500" /><button disabled={isLoading || !input.trim()} className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-bold text-amber-400 disabled:opacity-40"><Send size={18} /> إرسال</button></form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-[var(--color-desert-200)] bg-white p-5 shadow-sm"><h2 className="font-black">صندوق Maestro</h2><p className="mt-1 text-xs text-[var(--color-desert-500)]">تنبيهات مفتوحة مرتبة للمراجعة البشرية</p><div className="mt-4 space-y-3">{briefing?.alerts.length ? briefing.alerts.map((alert) => <div key={alert.id} className="rounded-2xl border border-stone-200 p-3"><div className="flex items-center justify-between gap-2"><span className="font-bold">{alert.title}</span><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${alert.priority === 'critical' ? 'bg-rose-100 text-rose-800' : alert.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'}`}>{alert.priority || 'medium'}</span></div><p className="mt-2 text-xs leading-5 text-stone-600">{alert.description}</p>{alert.confidence && <p className="mt-2 text-[10px] font-bold text-stone-400">درجة الثقة {Math.round(Number(alert.confidence) * 100)}%</p>}</div>) : <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">لا توجد تنبيهات مفتوحة.</p>}</div></div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900"><div className="flex items-center gap-2 font-black"><ShieldCheck size={17} /> المرحلة 3: الرقابة الاستباقية</div><p className="mt-2 leading-6">يراقب Maestro المتأخرات وتأخيرات ZATCA ومستندات الموارد البشرية وانخفاض المخزون والمواعيد النهائية. تُزال التنبيهات المكررة، ويمكن تأجيلها أو إغلاقها مع الاحتفاظ بسجل تدقيق.</p></div>
        </aside>
      </div>
    </div>
  );
}
