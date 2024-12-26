// api/ai/chat.ts
import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enable streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Parse the request body
    let messages;
    if (typeof req.body === 'string') {
      messages = JSON.parse(req.body).messages;
    } else {
      messages = req.body.messages;
    }

    if (!messages) {
      throw new Error('No messages provided');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI co-founder assistant, helping entrepreneurs build and grow their startups. Provide strategic advice, answer questions, and help with planning.'
        },
        ...messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000
    });

    // Stream each chunk of the response
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error: any) {
    console.error('Chat API error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'An error occurred' })}\n\n`);
    res.end();
  }
}