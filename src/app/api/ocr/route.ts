import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export const maxDuration = 30; // Allow 30 seconds for AI processing

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('receipt') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;

    // DEMO MODE: If no API key is provided, return a mocked response after a short delay
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'fake-key-to-allow-build') {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI processing time
      return new Response(JSON.stringify({
        success: true,
        data: {
          description: "مكتبة جرير - أدوات مكتبية (تم الاستخراج بالذكاء الاصطناعي)",
          amount: 299.50,
          category: "office"
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // REAL MODE: Send to Claude 3.5 Sonnet
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-latest'),
      schema: z.object({
        description: z.string().describe('The name of the vendor, store, or a brief description of the items purchased. Keep it concise, output in Arabic if possible.'),
        amount: z.number().describe('The total final amount of the receipt or invoice.'),
        category: z.enum(['office', 'travel', 'software', 'meals']).describe('The most appropriate accounting category for this expense.')
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this receipt/invoice and extract the total amount, vendor description, and categorize the expense.' },
            { type: 'image', image: `data:${mimeType};base64,${base64Data}` }
          ]
        }
      ]
    });

    return new Response(JSON.stringify({ success: true, data: object }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('OCR Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
