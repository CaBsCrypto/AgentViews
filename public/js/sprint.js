// sprint.js — Motor SCRUM: standup → trabajo → sprint review
import { setAgentState, setAllAgentsWorking, setAllAgentsDone, resetAgents } from './office.js';

const API = window.location.origin;

let currentTasks  = [];
let currentTopic  = '';
let sprintPhase   = 'idle'; // idle | standup | working | review

// ─── Fases del sprint ────────────────────────────────────────────────────────

export async function runSprint(topic, onProgress) {
  currentTopic = topic;
  sprintPhase  = 'standup';
  onProgress?.('standup', `📋 Standup: "${topic}"`);

  resetAgents();
  setAgentState('mgr', 'working');

  await delay(1200);

  // Fase 1: generar tareas
  onProgress?.('tasks', '🔍 Generando tareas del sprint...');
  setAllAgentsWorking();

  try {
    const res  = await fetch(`${API}/api/generate-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    currentTasks = data.tasks;
    onProgress?.('tasks_done', currentTasks);

    // Fase 2: trabajo (simula agentes completando tareas)
    sprintPhase = 'working';
    onProgress?.('working', '⚡ Sprint en progreso...');
    await simulateWork(onProgress);

    // Fase 3: review
    sprintPhase = 'review';
    setAllAgentsDone();
    onProgress?.('review', '✅ Sprint completado!');

    return currentTasks;
  } catch (e) {
    onProgress?.('error', `❌ Error: ${e.message}`);
    resetAgents();
    sprintPhase = 'idle';
    throw e;
  }
}

async function simulateWork(onProgress) {
  for (let i = 0; i < currentTasks.length; i++) {
    const task = currentTasks[i];
    await delay(600 + Math.random() * 400);
    setAgentState(task.agent, 'working');
    onProgress?.('task_progress', { task, index: i, total: currentTasks.length });
  }
  await delay(800);
}

// ─── Script Engine ────────────────────────────────────────────────────────────

export async function runScriptEngine(project, kol, onProgress) {
  onProgress?.('search', '🔎 Investigador buscando datos...');
  setAgentState('inv', 'working');

  let research = '';

  try {
    // Búsqueda paralela: noticias + reddit
    const [newsRes, redditRes] = await Promise.allSettled([
      fetch(`${API}/api/search?q=${encodeURIComponent(project)}&type=news&count=5`).then(r => r.json()),
      fetch(`${API}/api/reddit?q=${encodeURIComponent(project)}`).then(r => r.json())
    ]);

    if (newsRes.status === 'fulfilled' && newsRes.value.results) {
      const items = newsRes.value.results.slice(0, 3);
      research += `NOTICIAS:\n${items.map(n => `- ${n.title} (${n.url})`).join('\n')}\n\n`;
    }

    if (redditRes.status === 'fulfilled' && redditRes.value.posts) {
      const posts = redditRes.value.posts.slice(0, 3);
      research += `REDDIT:\n${posts.map(p => `- [${p.score}pts] ${p.title}`).join('\n')}\n`;
    }

    // Intentar CoinGecko si parece un token
    const coinMatch = project.match(/\b([A-Z]{2,6})\b/);
    if (coinMatch) {
      try {
        const cgRes = await fetch(`${API}/api/coingecko?coin=${encodeURIComponent(coinMatch[1])}`);
        const cg    = await cgRes.json();
        if (cg.price) {
          research += `\nTOKEN DATA: ${cg.name} (${cg.symbol}) $${cg.price} | 24h: ${cg.change24h}% | Sentiment: ${cg.sentiment}%\n`;
        }
      } catch {}
    }

    onProgress?.('research_done', research || 'Sin datos adicionales encontrados.');
    setAgentState('inv', 'done');
    setAgentState('gun', 'working');

    // Generar script
    onProgress?.('writing', '✍️ Guionista escribiendo script...');
    const scriptRes = await fetch(`${API}/api/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project, research, kol })
    });
    const scriptData = await scriptRes.json();
    if (scriptData.error) throw new Error(scriptData.error);

    setAgentState('gun', 'done');
    setAgentState('qa', 'working');
    onProgress?.('qa', '🔍 QA revisando...');
    await delay(1000);
    setAgentState('qa', 'done');

    onProgress?.('script_done', { script: scriptData.script, research });
    return { script: scriptData.script, research };
  } catch (e) {
    onProgress?.('error', `❌ Error: ${e.message}`);
    throw e;
  }
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export function getCurrentTasks()  { return currentTasks; }
export function getCurrentPhase()  { return sprintPhase; }
