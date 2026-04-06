import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_FUENTES_DS,
      sorts: [{ property: 'Fecha', direction: 'descending' }]
    });

    const sources = response.results.map(page => ({
      id: page.id,
      titulo: page.properties['Título']?.title[0]?.text?.content || '',
      url: page.properties['URL']?.rich_text[0]?.text?.content || '',
      proyecto: page.properties['Proyecto']?.rich_text[0]?.text?.content || '',
      tipo: page.properties['Tipo']?.select?.name || 'Web',
      resumen: page.properties['Resumen']?.rich_text[0]?.text?.content || '',
      confiabilidad: page.properties['Confiabilidad']?.select?.name || 'Media',
      fecha: page.properties['Fecha']?.date?.start || ''
    }));

    return res.status(200).json({ sources });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
