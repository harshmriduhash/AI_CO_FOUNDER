import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mock data for usage statistics
  const usageData = [
    { date: '2023-01-01', ideas: 10, documents: 5, code: 2 },
    { date: '2023-01-02', ideas: 8, documents: 3, code: 1 },
    // Add more mock data as needed
  ];

  return res.status(200).json(usageData);
}
