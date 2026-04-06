// kanban.js — Tablero de tareas con drag & drop

const AGENT_COLORS = {
  mgr: '#ff006e', inv: '#00f5ff', gun: '#bf00ff',
  adp: '#39ff14', qa: '#ffbe0b', jun: '#aaaaaa'
};

const PRIO_COLORS = { high: '#ff4444', med: '#ffaa00', low: '#44aaff' };

let draggedCard = null;

export function initKanban(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="kanban-board">
      <div class="kanban-col" id="col-backlog"    data-status="backlog">
        <div class="col-header">📋 Backlog</div>
        <div class="col-body" id="body-backlog"></div>
      </div>
      <div class="kanban-col" id="col-inprogress" data-status="inprogress">
        <div class="col-header">⚡ In Progress</div>
        <div class="col-body" id="body-inprogress"></div>
      </div>
      <div class="kanban-col" id="col-done"       data-status="done">
        <div class="col-header">✅ Done</div>
        <div class="col-body" id="body-done"></div>
      </div>
    </div>
  `;

  // Drag-over handlers for columns
  container.querySelectorAll('.col-body').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', ()  => col.classList.remove('drag-over'));
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (draggedCard) col.appendChild(draggedCard);
      draggedCard = null;
    });
  });
}

export function loadTasks(tasks) {
  clearKanban();
  tasks.forEach((task, i) => addCard(task, i, 'backlog'));
}

export function moveCardToInProgress(taskIndex) {
  const card = document.getElementById(`card-${taskIndex}`);
  if (card) document.getElementById('body-inprogress')?.appendChild(card);
}

export function moveCardToDone(taskIndex) {
  const card = document.getElementById(`card-${taskIndex}`);
  if (card) document.getElementById('body-done')?.appendChild(card);
}

export function clearKanban() {
  ['backlog', 'inprogress', 'done'].forEach(id => {
    const body = document.getElementById(`body-${id}`);
    if (body) body.innerHTML = '';
  });
}

function addCard(task, index, column) {
  const body = document.getElementById(`body-${column}`);
  if (!body) return;

  const card = document.createElement('div');
  card.className    = 'kanban-card';
  card.id           = `card-${index}`;
  card.draggable    = true;
  card.style.borderLeftColor = AGENT_COLORS[task.agent] || '#555';

  card.innerHTML = `
    <div class="card-title">${task.title}</div>
    <div class="card-meta">
      <span class="tag-agent" style="color:${AGENT_COLORS[task.agent] || '#aaa'}">${task.agent.toUpperCase()}</span>
      <span class="tag-prio"  style="color:${PRIO_COLORS[task.prio]  || '#aaa'}">${task.prio}</span>
    </div>
  `;

  card.addEventListener('dragstart', () => { draggedCard = card; card.classList.add('dragging'); });
  card.addEventListener('dragend',   () => card.classList.remove('dragging'));

  body.appendChild(card);
}
