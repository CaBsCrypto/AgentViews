import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { titulo, proyecto, kol, script, fuentes, duracion = '90s' } = req.body;
  if (!script) return res.status(400).json({ error: 'script requerido' });

  try {
    const page = await notion.pages.create({
      parent: { database_id: process.env.NOTION_SCRIPTS_DS },
      properties: {
        'Título': { title: [{ text: { content: titulo || proyecto || 'Sin título' } }] },
        'Proyecto': { rich_text: [{ text: { content: proyecto || '' } }] },
        'KOL': { select: { name: kol || 'General' } },
        'Estado': { select: { name: 'Borrador' } },
        'Duración': { select: { name: duracion } },
        'Idioma': { select: { name: 'ES Neutro' } },
        'Research usado': { checkbox: true },
        'Script': { rich_text: [{ text: { content: script.slice(0, 2000) } }] },
        'Fuentes': { rich_text: [{ text: { content: fuentes || '' } }] },
        'Fecha': { date: { start: new Date().toISOString().split('T')[0] } }
      }
    });
    return res.status(200).json({ id: page.id, url: page.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
