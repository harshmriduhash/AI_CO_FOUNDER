// api/ai/generate-document.ts
import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, businessInfo, audience, purpose, tone } = req.body;

    const documentPrompts = {
      'pitch_deck': 'Create a compelling pitch deck outline with key slides and content',
      'business_plan': 'Write a detailed business plan following standard industry format',
      'marketing_plan': 'Develop a comprehensive marketing strategy and execution plan',
      'financial_projection': 'Generate financial projections and analysis',
      'executive_summary': 'Write a concise executive summary highlighting key business aspects'
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert business document writer. Generate professional ${type} documents that are detailed, well-structured, and tailored to the audience.`
        },
        {
          role: 'user',
          content: `${documentPrompts[type as keyof typeof documentPrompts]}
          
          Business Information: ${JSON.stringify(businessInfo)}
          Target Audience: ${audience}
          Purpose: ${purpose}
          Tone: ${tone}
          
          Provide the document in a well-formatted structure with clear sections and professional language.`
        }
      ],
      temperature: 0.4,
      max_tokens: 3000
    });

    return res.status(200).json({
      document: completion.choices[0].message.content,
      type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Document generation error:', error);
    return res.status(500).json({ error: 'Failed to generate document' });
  }
}