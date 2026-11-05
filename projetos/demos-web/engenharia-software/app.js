// GUIA DE EDIÇÃO: ajuste REQUIREMENTS para trocar o estudo de caso; as funções render* atualizam backlog, sprint e rastreabilidade.
(() => {
  'use strict';

  // Requisitos e cenários fictícios do estudo de caso de reserva de salas.
  // "points" usa estimativa relativa para a atividade, não uma previsão em horas.
  const REQUIREMENTS = [
    { id:'REQ-01', title:'Consultar horários disponíveis', kind:'Funcional', priority:'Must', points:3, story:'Como estudante, quero consultar os horários livres de uma sala para escolher quando estudar.', criteria:['A pessoa seleciona uma data e uma sala.','O sistema lista apenas intervalos sem reserva confirmada.'], test:'Dada uma sala com períodos reservados, ao consultar a data, os horários ocupados não aparecem como disponíveis.' },
    { id:'REQ-02', title:'Reservar um horário', kind:'Funcional', priority:'Must', points:5, story:'Como estudante, quero reservar um horário livre para garantir o uso da sala.', criteria:['A pessoa informa sala, data e intervalo disponível.','Após confirmar, a reserva aparece na lista da pessoa.'], test:'Ao confirmar um intervalo livre com dados válidos, uma reserva é criada e fica visível para a pessoa.' },
    { id:'REQ-03', title:'Cancelar uma reserva', kind:'Funcional', priority:'Should', points:3, story:'Como estudante, quero cancelar uma reserva que não vou mais utilizar para liberar o horário.', criteria:['A pessoa pode selecionar uma reserva futura própria.','O horário cancelado volta a aparecer como disponível.'], test:'Ao cancelar uma reserva futura, o sistema atualiza seu estado e libera o intervalo.' },
    { id:'REQ-04', title:'Impedir conflito de horários', kind:'Funcional', priority:'Must', points:3, story:'Como responsável pelo sistema, quero impedir duas reservas para a mesma sala e intervalo.', criteria:['A disponibilidade é verificada no momento da confirmação.','Uma segunda reserva conflitante não é confirmada.'], test:'Duas tentativas simultâneas para a mesma sala e horário resultam em no máximo uma reserva confirmada.' },
    { id:'REQ-05', title:'Usar a tela em celular e teclado', kind:'Qualidade', priority:'Should', points:2, story:'Como estudante, quero navegar pelo fluxo de reserva em diferentes telas e usando teclado.', criteria:['Os controles funcionam em viewport estreita.','Campos e ações têm rótulos acessíveis e foco visível.'], test:'Em viewport móvel, a tela não exige rolagem horizontal e as ações podem ser concluídas com teclado.' },
    { id:'REQ-06', title:'Receber confirmação da reserva', kind:'Funcional', priority:'Could', points:2, story:'Como estudante, quero receber uma confirmação após reservar para saber que o pedido foi registrado.', criteria:['A confirmação informa sala, data e intervalo.','A mensagem só aparece após a reserva ser criada.'], test:'Após uma reserva válida, a confirmação exibe os dados do intervalo reservado.' }
  ];
  const SPRINT_CAPACITY = 8;
  const $ = (selector) => document.querySelector(selector);
  const state = {
    selectedId: REQUIREMENTS[0].id,
    filter: 'all',
    planned: new Set(['REQ-01', 'REQ-04']),
    priorities: Object.fromEntries(REQUIREMENTS.map((item) => [item.id, item.priority])),
    testResults: Object.fromEntries(REQUIREMENTS.map((item) => [item.id, 'pending'])),
    phase: 'requirements'
  };

  const phases = {
    requirements: ['Requisitos · entender a necessidade', 'Converse com estudantes e responsáveis, registre objetivos e separe requisitos funcionais dos atributos de qualidade.'],
    design: ['Projeto · propor uma solução', 'Defina fluxo de reserva, estados do horário e limites do sistema antes de implementar. Diagramas podem comunicar a estrutura e os comportamentos.'],
    delivery: ['Construção · dividir em incrementos', 'Selecione itens pequenos para a sprint, implemente e integre as mudanças mantendo o backlog priorizado.'],
    verification: ['Verificação · conferir critérios', 'Execute cenários ligados aos requisitos, registre resultados e revise falhas antes de considerar o incremento pronto.']
  };

  function priorityClass(priority) {
    return priority === 'Must' ? 'priority-must' : priority === 'Should' ? 'priority-should' : 'priority-could';
  }

  // Lista apenas requisitos que correspondem ao filtro selecionado.
  function renderBacklog() {
    const list = $('#requirement-list');
    const items = REQUIREMENTS.filter((item) => state.filter === 'all' || item.kind === state.filter);
    list.innerHTML = items.map((item) => {
      const selected = item.id === state.selectedId;
      return '<li><button class="req-button ' + (selected ? 'selected' : '') + '" type="button" data-requirement="' + item.id + '" aria-pressed="' + selected + '">' +
        '<span><span class="req-title">' + item.id + ' · ' + item.title + '</span><span class="req-meta">' + item.kind + ' · ' + item.points + ' pontos</span></span>' +
        '<span class="req-badge ' + priorityClass(state.priorities[item.id]) + '">' + state.priorities[item.id] + '</span></button></li>';
    }).join('');
    list.querySelectorAll('[data-requirement]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedId = button.dataset.requirement;
        renderBacklog();
        renderDetail();
      });
    });
  }

  // Apresenta a história, critérios de aceite e controles para cada requisito.
  function renderDetail() {
    const item = REQUIREMENTS.find((entry) => entry.id === state.selectedId);
    if (!item) return;
    $('#detail-id').textContent = item.id;
    const isPlanned = state.planned.has(item.id);
    const criteria = item.criteria.map((criterion) => '<li>' + criterion + '</li>').join('');
    const priority = state.priorities[item.id];
    $('#requirement-detail').innerHTML =
      '<div class="detail-content">' +
        '<span class="detail-kind">' + item.kind + ' · ' + item.points + ' pontos relativos</span>' +
        '<h3 class="detail-title">' + item.title + '</h3>' +
        '<p class="story">' + item.story + '</p>' +
        '<div><strong class="detail-kind">Critérios de aceitação</strong><ul class="criteria">' + criteria + '</ul></div>' +
        '<div class="priority-control"><label for="priority-select">Prioridade MoSCoW</label><select id="priority-select">' +
          '<option value="Must" ' + (priority === 'Must' ? 'selected' : '') + '>Must · essencial</option>' +
          '<option value="Should" ' + (priority === 'Should' ? 'selected' : '') + '>Should · importante</option>' +
          '<option value="Could" ' + (priority === 'Could' ? 'selected' : '') + '>Could · desejável</option>' +
          '<option value="Won’t" ' + (priority === 'Won’t' ? 'selected' : '') + '>Won’t · fora desta versão</option>' +
        '</select></div>' +
        '<div class="detail-actions"><button class="primary" id="toggle-sprint" type="button">' + (isPlanned ? 'Remover da Sprint' : 'Adicionar à Sprint') + '</button><p class="detail-status">' + (isPlanned ? 'Este requisito está no planejamento atual.' : 'Este requisito ainda está no backlog.') + '</p></div>' +
      '</div>';
    $('#priority-select').addEventListener('change', (event) => {
      state.priorities[item.id] = event.target.value;
      renderBacklog();
    });
    $('#toggle-sprint').addEventListener('click', () => {
      if (state.planned.has(item.id)) state.planned.delete(item.id);
      else state.planned.add(item.id);
      renderDetail();
      renderSprint();
    });
  }

  // Soma os pontos relativos e sinaliza quando o escopo excede a capacidade acordada.
  function renderSprint() {
    const items = REQUIREMENTS.filter((item) => state.planned.has(item.id));
    const points = items.reduce((sum, item) => sum + item.points, 0);
    const percent = Math.min(100, (points / SPRINT_CAPACITY) * 100);
    $('#sprint-points').textContent = points + ' / ' + SPRINT_CAPACITY + ' pts';
    $('#sprint-count').textContent = String(items.length);
    $('#sprint-progress').style.width = percent + '%';
    $('.progress-track').setAttribute('aria-valuenow', String(Math.min(points, SPRINT_CAPACITY)));
    $('#sprint-status').textContent = points > SPRINT_CAPACITY
      ? 'Plano acima da capacidade em ' + (points - SPRINT_CAPACITY) + ' ponto(s). Reveja o escopo antes de iniciar.'
      : points === SPRINT_CAPACITY
        ? 'Capacidade preenchida. Considere riscos e dependências antes de assumir o compromisso.'
        : 'Ainda há ' + (SPRINT_CAPACITY - points) + ' ponto(s) de capacidade estimada.';
    $('#sprint-status').classList.toggle('warning', points > SPRINT_CAPACITY);
    $('#sprint-empty').hidden = items.length > 0;
    $('#sprint-list').innerHTML = items.map((item) => '<li class="sprint-item"><span><strong>' + item.id + ' · ' + item.title + '</strong><br><small>' + state.priorities[item.id] + ' · ' + item.kind + '</small></span><strong>' + item.points + ' pts</strong></li>').join('');
  }

  // Mostra rastreabilidade e permite simular resultados dos testes de aceitação.
  function renderTests() {
    const passed = Object.values(state.testResults).filter((result) => result === 'pass').length;
    const total = REQUIREMENTS.length;
    $('#trace-count').textContent = total + ' / ' + total;
    $('#passed-count').textContent = passed + ' / ' + total;
    $('#coverage').textContent = Math.round((passed / total) * 100) + '%';
    $('#test-table').innerHTML = REQUIREMENTS.map((item) => {
      const result = state.testResults[item.id];
      const label = result === 'pass' ? 'Aprovado' : result === 'fail' ? 'Falhou' : 'Pendente';
      const statusClass = result === 'pass' ? 'pass' : result === 'fail' ? 'fail' : '';
      return '<tr><td><strong>' + item.id + '</strong><small>' + item.title + '</small></td>' +
        '<td>' + item.test + '</td><td><span class="test-status ' + statusClass + '">' + label + '</span></td>' +
        '<td><div class="test-actions"><button class="small-action" type="button" data-test="' + item.id + '" data-result="pass">Simular aprovação</button><button class="small-action" type="button" data-test="' + item.id + '" data-result="fail">Simular falha</button></div></td></tr>';
    }).join('');
  }

  // Explica os artefatos principais de cada etapa do ciclo didático.
  function renderPhase() {
    const phase = phases[state.phase];
    $('#phase-content').innerHTML = '<strong>' + phase[0] + '</strong><p>' + phase[1] + '</p>';
    document.querySelectorAll('[data-phase]').forEach((button) => {
      const active = button.dataset.phase === state.phase;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle('active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      // Se o requisito ativo ficou fora do filtro, seleciona o primeiro item visível.
      const visible = REQUIREMENTS.filter((item) => state.filter === 'all' || item.kind === state.filter);
      if (!visible.some((item) => item.id === state.selectedId)) state.selectedId = visible[0].id;
      renderBacklog();
      renderDetail();
    });
  });

  document.querySelectorAll('[data-phase]').forEach((button) => {
    button.addEventListener('click', () => {
      state.phase = button.dataset.phase;
      renderPhase();
    });
  });

  $('#test-table').addEventListener('click', (event) => {
    const button = event.target.closest('[data-test][data-result]');
    if (!button) return;
    state.testResults[button.dataset.test] = button.dataset.result;
    renderTests();
  });

  // Estado inicial: duas histórias planejadas e nenhum teste executado.
  renderBacklog();
  renderDetail();
  renderSprint();
  renderTests();
  renderPhase();
})();