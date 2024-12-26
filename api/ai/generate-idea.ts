// api/ai/generate-idea.ts
import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received request body:', req.body);
    
    // Parse the request body if it's a string
    const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('Parsed request data:', bodyData);

    const { industry, targetMarket, technology, problemSpace } = bodyData;

    // Validate required fields
    if (!industry || !targetMarket || !technology || !problemSpace) {
      console.log('Missing required fields:', { industry, targetMarket, technology, problemSpace });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Making OpenAI API call with parameters:', {
      industry,
      targetMarket,
      technology,
      problemSpace
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a startup idea generator that creates innovative, market-viable business concepts. Format your response as detailed JSON.'
        },
        {
          role: 'user',
          content: `Generate a detailed startup idea with the following parameters:
          Industry: ${industry}
          Target Market: ${targetMarket}
          Technology: ${technology}
          Problem Space: ${problemSpace}
          
          Return a JSON object with these exact keys:
          {
            "name": "startup name",
            "pitch": "one line pitch",
            "description": "detailed description",
            "keyFeatures": ["feature1", "feature2", ...],
            "targetAudience": "target audience description",
            "revenueModel": "revenue model description",
            "challenges": ["challenge1", "challenge2", ...],
            "growthStrategy": "growth strategy description"
          }`
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    console.log('Received OpenAI response');
    const responseContent = completion.choices[0].message.content;
    console.log('Response content:', responseContent);

    const parsedResponse = JSON.parse(responseContent);
    console.log('Parsed response:', parsedResponse);

    return res.status(200).json(parsedResponse);
    
  } catch (error: any) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error instanceof SyntaxError) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: error.message
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    return res.status(500).json({ 
      error: 'Failed to generate idea',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}