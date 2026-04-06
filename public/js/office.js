// office.js — Canvas isométrico + 6 agentes animados
// Fórmula isométrica Habbo-style

const TW = 46, TH = 23;
let canvas, ctx, W, H, animFrame;

const AGENTS = {
  mgr: { id: 'mgr', name: 'Manager',      color: '#ff006e', col: 8,  row: 5, role: 'Scrum Master' },
  inv: { id: 'inv', name: 'Investigador', color: '#00f5ff', col: 2,  row: 2, role: 'Research' },
  gun: { id: 'gun', name: 'Guionista',    color: '#bf00ff', col: 2,  row: 8, role: 'Scripting' },
  adp: { id: 'adp', name: 'Adaptador',   color: '#39ff14', col: 13, row: 2, role: 'KOL Adapt' },
  qa:  { id: 'qa',  name: 'QA',           color: '#ffbe0b', col: 13, row: 8, role: 'Quality' },
  jun: { id: 'jun', name: 'Junior',       color: '#aaaaaa', col: 8,  row: 8, role: 'Support' }
};

// Agent state: idle | working | done | walking
const agentState = {};
const agentAnim  = {};  // tick counter per agent

Object.keys(AGENTS).forEach(id => {
  agentState[id] = 'idle';
  agentAnim[id]  = 0;
});

function ix(c, r) { return W / 2 + (c - r) * (TW / 2); }
function iy(c, r) { return 80  + (c + r) * (TH / 2); }

function drawTile(c, r, fillColor, strokeColor = '#1a1a2e') {
  const x = ix(c, r), y = iy(c, r);
  ctx.beginPath();
  ctx.moveTo(x,           y - TH / 2);
  ctx.lineTo(x + TW / 2, y);
  ctx.lineTo(x,           y + TH / 2);
  ctx.lineTo(x - TW / 2, y);
  ctx.closePath();
  ctx.fillStyle   = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth   = 1;
  ctx.fill();
  ctx.stroke();
}

function drawAgent(agent, tick) {
  const state = agentState[agent.id];
  const bounce = state === 'working' ? Math.sin(tick * 0.15) * 4 : Math.sin(tick * 0.05) * 2;
  const x = ix(agent.col, agent.row);
  const y = iy(agent.col, agent.row) - bounce;

  // Shadow
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 10, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.arc(x, y - 14, 10, 0, Math.PI * 2);
  ctx.fillStyle = agent.color;
  ctx.fill();
  ctx.strokeStyle = '#ffffff22';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - 26, 7, 0, Math.PI * 2);
  ctx.fillStyle = agent.color;
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x - 2.5, y - 27, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 2.5, y - 27, 1.5, 0, Math.PI * 2); ctx.fill();

  // Status dot
  const dotColor = state === 'working' ? '#00ff88' : state === 'done' ? '#ffbe0b' : '#555577';
  ctx.beginPath();
  ctx.arc(x + 10, y - 32, 4, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();

  // Name label
  ctx.fillStyle = '#ffffffcc';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(agent.name, x, y - 36);
}

function drawFloor() {
  const COLS = 16, ROWS = 12;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const even = (c + r) % 2 === 0;
      drawTile(c, r, even ? '#0d0d1a' : '#111127');
    }
  }

  // Desk zones (highlight)
  const desks = [
    [2, 2], [2, 8], [8, 5], [13, 2], [13, 8], [8, 8]
  ];
  desks.forEach(([c, r]) => {
    drawTile(c, r, '#1a1a3e', '#3a3a6e');
    drawTile(c + 1, r, '#16162e', '#2a2a5e');
  });
}

function render() {
  ctx.clearRect(0, 0, W, H);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#050510');
  grad.addColorStop(1, '#0a0a20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  drawFloor();

  // Draw agents sorted by row+col for correct iso depth
  const sorted = Object.values(AGENTS).sort((a, b) => (a.col + a.row) - (b.col + b.row));
  sorted.forEach(agent => {
    agentAnim[agent.id]++;
    drawAgent(agent, agentAnim[agent.id]);
  });

  // Title
  ctx.fillStyle = '#ffffff33';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BROWNS AI — UMBRA OFFICE', 10, 20);

  animFrame = requestAnimationFrame(render);
}

export function initOffice(canvasEl) {
  canvas = canvasEl;
  ctx    = canvas.getContext('2d');
  W      = canvas.width;
  H      = canvas.height;
  render();
}

export function setAgentState(id, state) {
  if (agentState[id] !== undefined) agentState[id] = state;
}

export function setAllAgentsWorking() {
  Object.keys(agentState).forEach(id => agentState[id] = 'working');
}

export function setAllAgentsDone() {
  Object.keys(agentState).forEach(id => agentState[id] = 'done');
}

export function resetAgents() {
  Object.keys(agentState).forEach(id => agentState[id] = 'idle');
}
