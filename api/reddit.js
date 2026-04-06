export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query requerida' });

  try {
    const r = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=5&t=week`,
      { headers: { 'User-Agent': 'BrownsAI/1.0' } }
    );
    const data = await r.json();
    const posts = data.data?.children?.map(p => ({
      title: p.data.title,
      score: p.data.score,
      comments: p.data.num_comments,
      subreddit: p.data.subreddit,
      url: `https://reddit.com${p.data.permalink}`
    }));
    return res.status(200).json({ posts });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
