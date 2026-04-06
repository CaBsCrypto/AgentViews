import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { titulo, url, proyecto, tipo = 'Web', resumen, confiabilidad = 'Media' } = req.body;
  if (!titulo) return res.status(400).json({ error: 'titulo requerido' });

  try {
    const page = await notion.pages.create({
      parent: { database_id: process.env.NOTION_FUENTES_DS },
      properties: {
        'Título': { title: [{ text: { content: titulo } }] },
        'URL': { rich_text: [{ text: { content: url || '' } }] },
        'Proyecto': { rich_text: [{ text: { content: proyecto || '' } }] },
        'Tipo': { select: { name: tipo } },
        'Resumen': { rich_text: [{ text: { content: resumen || '' } }] },
        'Confiabilidad': { select: { name: confiabilidad } },
        'Fecha': { date: { start: new Date().toISOString().split('T')[0] } }
      }
    });
    return res.status(200).json({ id: page.id, url: page.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
