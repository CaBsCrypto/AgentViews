import Groq from 'groq-sdk';
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { project, research, kol = 'General' } = req.body;
  if (!project) return res.status(400).json({ error: 'project requerido' });

  const kolStyles = {
    'Eminatrix': 'Estilo técnico y detallado. El usuario quiere entender el fondo.',
    'LadyMufa': 'Estilo casual y energético. Directo al grano, mucho hype positivo.',
    '1Dory': 'Enfocado en comunidad y FOMO. "Todo el mundo está hablando de esto".',
    'Camululis': 'Estilo propio, cercano, conversacional.',
    'TheLizardQueen': 'Estilo propio, misterioso, con gancho.',
    'General': 'Español neutro, gamer-to-gamer.'
  };

  try {
    const msg = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: `Eres el Guionista de Umbra, agencia KOL Web3 latinoamericana.
Escribes scripts de video 60-90s para creadores crypto/gaming.
KOL asignado: ${kol} — ${kolStyles[kol] || kolStyles['General']}

REGLAS ABSOLUTAS:
- Tono gamer-to-gamer: como recomendando algo a un amigo
- Español neutro sin regionalismos
- Hook poderoso en los primeros 3 segundos
- FOMO orgánico, nunca forzado
- NUNCA: "revolucionario", "innovador", "cambiar el juego"
- CTA claro pero no agresivo
- Formato:
  [HOOK 0:00-0:05]
  [CONTEXTO 0:05-0:25]
  [POR QUÉ IMPORTA 0:25-0:50]
  [CTA 0:50-1:00]`
        },
        {
          role: 'user',
          content: `Proyecto: ${project}\nResearch con datos reales:\n${research || 'Sin research adicional'}\n\nEscribe el script completo.`
        }
      ]
    });
    return res.status(200).json({ script: msg.choices[0].message.content });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
