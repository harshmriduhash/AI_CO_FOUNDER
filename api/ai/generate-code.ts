import { Configuration, OpenAIApi } from 'openai-edge';
import { NextRequest } from 'next/server';

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Enable Edge Runtime
export const config = {
  runtime: 'edge'
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { template, specifications, features } = await req.json();

    const response = await openai.createChatCompletion({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert software developer. Generate production-ready, well-documented code based on the provided specifications. 
          Include error handling, best practices, and comments explaining key functionality.`
        },
        {
          role: 'user',
          content: `Generate code for a ${template} with the following:
          Tech Stack: ${specifications.techStack.join(', ')}
          Features: ${JSON.stringify(features)}
          Specifications: ${JSON.stringify(specifications)}
          
          Provide:
          1. Main implementation code
          2. Required dependencies
          3. Setup instructions
          4. API documentation (if applicable)
          5. Testing guidelines`
        }
      ],
      stream: true,
      temperature: 0.2,
      max_tokens: 4000
    });

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('Code generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Error generating code',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}