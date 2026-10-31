// Registros fictícios usados somente durante a sessão do protótipo.
const tickets = [
  { id: 1, title: 'Computador não inicia', requester: 'Marina Costa', location: 'Laboratório 204', category: 'Computadores', priority: 'Alta', status: 'Aberto', created: 'Hoje, 09:42', description: 'A estação não liga após a última aula.' },
  { id: 2, title: 'Projetor sem sinal', requester: 'Rafael Souza', location: 'Laboratório 108', category: 'Projetor', priority: 'Média', status: 'Em andamento', created: 'Hoje, 08:15', description: 'Projetor liga, mas não reconhece o computador.' },
  { id: 3, title: 'Acesso à rede instável', requester: 'Camila Lima', location: 'Laboratório 302', category: 'Rede', priority: 'Alta', status: 'Aberto', created: 'Ontem, 16:30', description: 'Conexão cai durante as atividades.' },
  { id: 4, title: 'Instalação de editor de código', requester: 'Pedro Alves', location: 'Laboratório 105', category: 'Software', priority: 'Baixa', status: 'Concluído', created: 'Ontem, 14:05', description: 'Solicitação de instalação para uma atividade.' },
  { id: 5, title: 'Teclado com teclas falhando', requester: 'Ana Ribeiro', location: 'Laboratório 204', category: 'Computadores', priority: 'Média', status: 'Em andamento', created: 'Ontem, 11:20', description: 'Algumas teclas não respondem.' }
];

let activeFilter = 'Todos';
const list = document.querySelector('#ticket-list');
const dialog = document.querySelector('#ticket-dialog');
const form = document.querySelector('#ticket-form');
const search = document.querySelector('#search');

function statusClass(status) {
  return `status-${status.replaceAll(' ', '-')}`;
}

// Recalcula os indicadores e apresenta somente os chamados que atendem à busca e ao filtro.
function render() {
  const counts = {
    'Aberto': tickets.filter(ticket => ticket.status === 'Aberto').length,
    'Em andamento': tickets.filter(ticket => ticket.status === 'Em andamento').length,
    'Concluído': tickets.filter(ticket => ticket.status === 'Concluído').length
  };
  document.querySelector('#count-open').textContent = counts['Aberto'];
  document.querySelector('#count-progress').textContent = counts['Em andamento'];
  document.querySelector('#count-done').textContent = counts['Concluído'];
  document.querySelector('#count-total').textContent = tickets.length;

  const term = search.value.trim().toLocaleLowerCase('pt-BR');
  const visible = tickets.filter(ticket => {
    const matchesStatus = activeFilter === 'Todos' || ticket.status === activeFilter;
    const searchable = `${ticket.title} ${ticket.requester} ${ticket.location} ${ticket.category}`.toLocaleLowerCase('pt-BR');
    return matchesStatus && searchable.includes(term);
  });

  list.replaceChildren(...visible.map(ticket => {
    const row = document.createElement('tr');
    const nextStatus = ticket.status === 'Aberto' ? 'Em andamento' : ticket.status === 'Em andamento' ? 'Concluído' : 'Aberto';
    const buttonLabel = ticket.status === 'Concluído' ? 'Reabrir' : ticket.status === 'Aberto' ? 'Iniciar' : 'Concluir';
    row.innerHTML = `
      <td><span class="ticket-title"></span><span class="ticket-meta"></span></td>
      <td class="location-cell"></td>
      <td><span class="category-tag"></span></td>
      <td><span class="priority-tag"></span></td>
      <td><span class="status-tag"></span></td>
      <td><button class="row-action" type="button"></button></td>`;
    row.querySelector('.ticket-title').textContent = ticket.title;
    row.querySelector('.ticket-meta').textContent = `${ticket.requester} · ${ticket.created}`;
    row.querySelector('.location-cell').textContent = ticket.location;
    row.querySelector('.category-tag').textContent = ticket.category;
    const priority = row.querySelector('.priority-tag');
    priority.textContent = ticket.priority;
    priority.classList.add(`priority-${ticket.priority}`);
    const status = row.querySelector('.status-tag');
    status.textContent = ticket.status;
    status.classList.add(statusClass(ticket.status));
    const action = row.querySelector('.row-action');
    action.dataset.id = ticket.id;
    action.dataset.nextStatus = nextStatus;
    action.textContent = buttonLabel;
    action.setAttribute('aria-label', `${buttonLabel} chamado: ${ticket.title}`);
    return row;
  }));

  document.querySelector('#empty-state').hidden = visible.length !== 0;
  document.querySelector('#result-count').textContent = `${visible.length} ${visible.length === 1 ? 'chamado exibido' : 'chamados exibidos'}`;
}

document.querySelectorAll('.filter-button').forEach(button => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach(item => item.classList.toggle('active', item === button));
    render();
  });
});

search.addEventListener('input', render);
list.addEventListener('click', event => {
  const button = event.target.closest('[data-id]');
  if (!button) return;
  const ticket = tickets.find(item => item.id === Number(button.dataset.id));
  ticket.status = button.dataset.nextStatus;
  document.querySelector('#announcement').textContent = `Status atualizado para ${ticket.status}.`;
  render();
});

function closeDialog() { dialog.close(); }
document.querySelector('#open-form').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-form').addEventListener('click', closeDialog);
document.querySelector('#cancel-form').addEventListener('click', closeDialog);

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  tickets.unshift({
    id: Date.now(),
    title: data.get('title').trim(),
    requester: data.get('requester').trim(),
    location: data.get('location').trim(),
    category: data.get('category'),
    priority: data.get('priority'),
    status: 'Aberto',
    created: 'Agora',
    description: data.get('description').trim()
  });
  form.reset();
  activeFilter = 'Todos';
  document.querySelectorAll('.filter-button').forEach(button => button.classList.toggle('active', button.dataset.filter === 'Todos'));
  search.value = '';
  closeDialog();
  render();
  document.querySelector('#announcement').textContent = 'Chamado registrado com status aberto.';
});

render();
