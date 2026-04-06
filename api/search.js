export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, type = 'news', count = 5 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query requerida' });

  try {
    const endpoint = type === 'news'
      ? 'https://api.search.brave.com/res/v1/news/search'
      : 'https://api.search.brave.com/res/v1/web/search';

    const r = await fetch(
      `${endpoint}?q=${encodeURIComponent(q)}&count=${count}&freshness=pw`,
      {
        headers: {
          'X-Subscription-Token': process.env.BRAVE_API_KEY,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      }
    );
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
