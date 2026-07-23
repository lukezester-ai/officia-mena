/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function extractInvoiceData(prompt: string) {
  try {
    const systemPrompt = `
      You are an AI assistant that extracts invoice details from natural language.
      The user will provide a sentence describing what they sold, e.g., "بيع 2 لابتوب ديل لشركة التقنية بسعر 3500 ريال و ماوس ب 150".
      
      Extract:
      1. The client's name or company if mentioned (e.g., "شركة التقنية"). If not mentioned, return empty string.
      2. The list of items sold. For each item, extract the description (in Arabic), the quantity, and the unit price in SAR.
      If a quantity is not mentioned, assume 1.
    `;

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        clientName: z.string().describe('The name of the client if mentioned, else empty'),
        items: z.array(z.object({
          description: z.string().describe('The name/description of the product sold in Arabic'),
          quantity: z.number().describe('The quantity sold'),
          unitPrice: z.number().describe('The price per unit in SAR')
        }))
      }),
      prompt: systemPrompt + '\nUser input: ' + prompt,
    });

    return { success: true, data: object };
  } catch (error: any) {
    console.error('AI Auto-fill error:', error);
    return { success: false, error: error.message };
  }
}
