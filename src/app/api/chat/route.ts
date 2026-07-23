import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { maestroTools } from '@/lib/ai/tools';

// We configure the SDK to use the user's API key if available
// Make sure to add ANTHROPIC_API_KEY to your .env file
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'fake-key-to-allow-build',
});

export const maxDuration = 30; // Allow up to 30 seconds for the LLM to run tools

export async function POST(req: Request) {
  // Fallback to mock response if API key is missing or invalid
  if (!process.env.ANTHROPIC_API_KEY || !process.env.ANTHROPIC_API_KEY.startsWith('sk-ant')) {
    // Mock response for demo purposes
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const text = "عذراً أيها المدير، لم يتم إعداد مفتاح الذكاء الاصطناعي (API Key) في إعدادات النظام. لكن، كرسالة تجريبية: بناءً على البيانات الحالية، لا يوجد أي بضائع ممنوعة في المخزون، وجميع رواتب الموظفين والإقامات سارية المفعول.";
        
        // Send format expected by useChat (x-vercel-ai-data-stream)
        const chunks = text.split(' ');
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk + ' ')}\n`));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1'
      }
    });
  }

  const { messages } = await req.json();

  const systemPrompt = `
You are "المايسترو" (The Maestro), the Chief AI Officer and Tax Advisor of Officia MENA ERP.
You orchestrate the various departments of the company (HR, Inventory, Accounting, Tax).
You have access to real-time database tools. 

When a user asks you to analyze the company or check for risks:
1. Use your tools to fetch data (e.g. getExpiringIqamas, getComplianceRisks, getPayrollSummary).
2. Synthesize the findings into a clear, professional report in Arabic.
3. Be highly proactive. If you see an expired security clearance or an expired Iqama, warn the user strictly about the legal consequences in Saudi Arabia.

When a user asks about TAXES, ZATCA, E-INVOICING (Fatoorah), or VAT:
1. ALWAYS use the \`searchZatcaRegulations\` tool to retrieve the official rules from the knowledge base.
2. Provide a legally-backed answer based ON THE RETRIEVED RULES, citing them clearly.

When a user asks about their INTERNAL COMPANY DOCUMENTS, CONTRACTS, or POLICIES:
1. Use the \`searchDocuments\` tool to search their uploaded files using semantic RAG.
2. Answer based on the retrieved document excerpts.

Remember: YOU MUST RESPOND ENTIRELY IN ARABIC. Always maintain a professional, high-level executive tone.
`;

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20240620'), // Using stable Claude 3.5 Sonnet
    system: systemPrompt,
    messages,
    tools: maestroTools,
    maxSteps: 5, // CRITICAL: This allows the LLM to call a tool, get the result, and continue responding
  });
  
  // @ts-expect-error The method exists in runtime in newer AI SDKs but TS types might lag
  return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toTextStreamResponse();
}
