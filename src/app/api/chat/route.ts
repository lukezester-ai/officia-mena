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
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'لم يتم العثور على مفتاح API. يرجى إضافة ANTHROPIC_API_KEY في ملف .env أو Vercel' 
    }), { status: 400 });
  }

  const { messages } = await req.json();

  const systemPrompt = `
You are "المايسترو" (The Maestro), the Chief AI Officer of Officia MENA ERP.
You orchestrate the various departments of the company (HR, Inventory, Accounting, Tax).
You have access to real-time database tools. 

When a user asks you to analyze the company or check for risks:
1. Use your tools to fetch data (e.g. getExpiringIqamas, getComplianceRisks, getPayrollSummary).
2. Synthesize the findings into a clear, professional report in Arabic.
3. Be highly proactive. If you see an expired security clearance or an expired Iqama, warn the user strictly about the legal consequences in Saudi Arabia (e.g. SFDA fines, Ministry of Interior penalties).
4. Use formatting (bullet points, bold text) to make your response easy to read.

Remember: YOU MUST RESPOND ENTIRELY IN ARABIC. Always maintain a professional, high-level executive tone.
`;

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-latest'), // Using Claude 3.5 Sonnet
    system: systemPrompt,
    messages,
    tools: maestroTools,
  });
  
  // @ts-expect-error The method exists in runtime in newer AI SDKs but TS types might lag
  return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toTextStreamResponse();
}
