/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { BrainCircuit, Send, User, Sparkles, AlertCircle } from 'lucide-react';

export default function AiMaestroPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const append = async (message: { role: string; content: string }) => {
    setIsLoading(true);
    setError(null);
    const newMessages = [...messages, { id: Date.now().toString(), ...message }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        // Parse Vercel AI SDK stream format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              assistantMessage.content += text;
              setMessages((prev) => prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m));
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput('');
    append({ role: 'user', content: currentInput });
  };

  return (
    <div className="max-w-5xl mx-auto h-[85vh] flex flex-col">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="p-3 bg-[var(--color-gold-50)] rounded-2xl border border-[var(--color-gold-200)]">
          <BrainCircuit size={32} className="text-[var(--color-gold-600)]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1 flex items-center gap-2">
            مركز القيادة الذكي (المايسترو)
            <Sparkles size={18} className="text-amber-500 animate-pulse" />
          </h1>
          <p className="text-[var(--color-desert-600)] text-sm">تحدث مع مدير الذكاء الاصطناعي الذي يشرف على جميع الأقسام (الموارد البشرية، المخزون، الضرائب).</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 mb-4 flex items-start gap-3 shrink-0">
          <AlertCircle className="text-rose-600 mt-1" />
          <div>
            <h3 className="font-bold text-rose-800">خطأ في الاتصال (Connection Error)</h3>
            <p className="text-sm text-rose-600">
              يرجى التأكد من إضافة مفتاح <code>ANTHROPIC_API_KEY</code> في ملف <code>.env</code> أو Vercel.
              <br/>
              (Error: {error.message})
            </p>
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 bg-white border border-[var(--color-desert-200)] rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <BrainCircuit size={64} className="text-[var(--color-gold-500)] opacity-80" />
              <div>
                <p className="text-2xl font-bold text-[var(--color-desert-900)] mb-3">أهلاً بك أيها المدير</p>
                <p className="text-base text-[var(--color-desert-700)] max-w-md mx-auto leading-relaxed">
                  أنا المايسترو. يمكنني الغوص في قواعد البيانات الخاصة بالشركة واستخراج تقارير حية عن المخاطر، الرواتب، والإقامات.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <button 
                  onClick={() => append({ role: 'user', content: 'حلل المخاطر القانونية اليوم' })}
                  className="bg-[var(--color-gold-50)] text-[var(--color-gold-700)] px-4 py-2 rounded-xl text-sm font-bold border border-[var(--color-gold-200)] shadow-sm hover:bg-[var(--color-gold-100)] transition-colors text-center"
                >
                  &quot;حلل المخاطر القانونية اليوم&quot;
                </button>
                <button 
                  onClick={() => append({ role: 'user', content: 'ما هو وضع الرواتب والإقامات؟' })}
                  className="bg-[var(--color-gold-50)] text-[var(--color-gold-700)] px-4 py-2 rounded-xl text-sm font-bold border border-[var(--color-gold-200)] shadow-sm hover:bg-[var(--color-gold-100)] transition-colors text-center"
                >
                  &quot;ما هو وضع الرواتب والإقامات؟&quot;
                </button>
              </div>
            </div>
          ) : (
            messages.map((m: any) => (
              <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  m.role === 'user' 
                    ? 'bg-[var(--color-desert-100)] border-[var(--color-desert-300)] text-[var(--color-desert-700)]' 
                    : 'bg-black border-[var(--color-gold-500)] text-[var(--color-gold-500)]'
                }`}>
                  {m.role === 'user' ? <User size={20} /> : <BrainCircuit size={20} />}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  m.role === 'user'
                    ? 'bg-[var(--color-desert-900)] text-white rounded-tr-none'
                    : 'bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] text-[var(--color-desert-900)] rounded-tl-none'
                }`}>
                  <div 
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: m.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        .replace(/- (.*?)\n/g, '<li class="ml-4 list-disc">$1</li>\n')
                    }} 
                  />
                </div>
              </div>
            ))
          )}
          
          {isLoading && !messages.some((m: any) => m.role === 'assistant' && !m.content) && (
            <div className="flex gap-4">
               <div className="shrink-0 w-10 h-10 rounded-full bg-black border-2 border-[var(--color-gold-500)] text-[var(--color-gold-500)] flex items-center justify-center">
                  <BrainCircuit size={20} className="animate-pulse" />
               </div>
               <div className="bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-2xl rounded-tl-none p-4 w-24 flex items-center justify-center gap-1">
                 <div className="w-2 h-2 bg-[var(--color-gold-500)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 bg-[var(--color-gold-500)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 bg-[var(--color-gold-500)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--color-desert-200)] bg-white">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="اكتب طلبك للمايسترو هنا... (مثال: هل يوجد بضائع ممنوعة في المخزون؟)"
              className="w-full bg-[var(--color-desert-50)] text-[var(--color-desert-900)] placeholder:text-[var(--color-desert-400)] border border-[var(--color-desert-200)] rounded-2xl py-4 pr-4 pl-14 text-sm focus:outline-none focus:border-[var(--color-gold-500)] disabled:opacity-50"
              dir="rtl"
            />
            <button 
              type="submit" 
              disabled={isLoading || !(input || '').trim()}
              className="absolute left-2 w-10 h-10 flex items-center justify-center bg-[var(--color-gold-500)] text-black rounded-xl hover:bg-[var(--color-gold-600)] transition-colors disabled:opacity-50 disabled:hover:bg-[var(--color-gold-500)]"
            >
              <Send size={18} className="mr-1" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-[var(--color-desert-400)]">
              المايسترو يستخدم Vercel AI SDK للاتصال بوكلاء الأقسام في الوقت الفعلي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
