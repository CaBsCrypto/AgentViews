import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_SCRIPTS_DS,
      sorts: [{ property: 'Fecha', direction: 'descending' }]
    });

    const scripts = response.results.map(page => ({
      id: page.id,
      titulo: page.properties['Título']?.title[0]?.text?.content || '',
      proyecto: page.properties['Proyecto']?.rich_text[0]?.text?.content || '',
      kol: page.properties['KOL']?.select?.name || 'General',
      estado: page.properties['Estado']?.select?.name || 'Borrador',
      duracion: page.properties['Duración']?.select?.name || '90s',
      idioma: page.properties['Idioma']?.select?.name || 'ES Neutro',
      fecha: page.properties['Fecha']?.date?.start || '',
      script: page.properties['Script']?.rich_text[0]?.text?.content || '',
      fuentes: page.properties['Fuentes']?.rich_text[0]?.text?.content || '',
      url: page.url
    }));

    return res.status(200).json({ scripts });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
