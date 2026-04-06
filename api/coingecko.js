export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { coin } = req.query;
  if (!coin) return res.status(400).json({ error: 'Coin requerido' });

  try {
    const search = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(coin)}`
    );
    const { coins } = await search.json();
    if (!coins?.length) return res.status(404).json({ error: 'No encontrado' });

    const detail = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coins[0].id}` +
      `?localization=false&tickers=false&community_data=true&developer_data=false`
    );
    const d = await detail.json();

    return res.status(200).json({
      name: d.name,
      symbol: d.symbol?.toUpperCase(),
      price: d.market_data?.current_price?.usd,
      change24h: d.market_data?.price_change_percentage_24h?.toFixed(2),
      marketCap: d.market_data?.market_cap?.usd,
      sentiment: d.sentiment_votes_up_percentage?.toFixed(0),
      twitterFollowers: d.community_data?.twitter_followers,
      desc: d.description?.en?.slice(0, 300)
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
