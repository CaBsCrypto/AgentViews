import Groq from 'groq-sdk';
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic requerido' });

  try {
    const msg = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: `Eres el Manager/Scrum Master de Umbra, agencia KOL Web3 LATAM.
Agentes disponibles:
- mgr = Manager (coordina, toma decisiones)
- inv = Investigador (busca datos, noticias, métricas)
- gun = Guionista (escribe scripts y copies)
- adp = Adaptador (personaliza por KOL)
- qa  = QA (verifica tono, CTA, calidad)
- jun = Junior (tareas de soporte, archivos)

Genera 8-10 tareas específicas y breves (máx 40 chars cada una).
Responde SOLO con JSON array, sin backticks, sin explicaciones:
[{"title":"tarea","agent":"mgr|inv|gun|adp|qa|jun","prio":"high|med|low"}]`
        },
        { role: 'user', content: `Tema del sprint: "${topic}"` }
      ]
    });

    const raw = msg.choices[0].message.content.replace(/```json|```/g, '').trim();
    const tasks = JSON.parse(raw);
    return res.status(200).json({ tasks });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
