// GUIA DE EDIÇÃO: demonstração LabPOO. Classes modelam os equipamentos; Armario protege a coleção; render redesenha cartões; listeners simulam eventos da janela Swing.
(() => {
  'use strict';

  // Classe-base: atributos privados protegem os dados comuns e os métodos definem ações válidas.
  class Equipamento {
    #patrimonio;
    #nome;
    #ligado = false;

    constructor(patrimonio, nome) {
      this.#patrimonio = this.#validarTexto(patrimonio, 'Patrimônio');
      this.#nome = this.#validarTexto(nome, 'Nome');
    }

    #validarTexto(valor, campo) {
      const texto = valor.trim();
      if (!texto) throw new Error(campo + ' é obrigatório.');
      return texto;
    }

    get patrimonio() { return this.#patrimonio; }
    get nome() { return this.#nome; }
    get ligado() { return this.#ligado; }

    ligar() { this.#ligado = true; }
    desligar() { this.#ligado = false; }

    resumo() {
      throw new Error('Implemente resumo() em uma subclasse concreta.');
    }
  }

  // Subclasses herdam os atributos e comportamentos comuns e especializam o resumo.
  class Notebook extends Equipamento {
    #sistemaOperacional;

    constructor(patrimonio, nome, sistemaOperacional) {
      super(patrimonio, nome);
      this.#sistemaOperacional = sistemaOperacional.trim();
      if (!this.#sistemaOperacional) throw new Error('Informe o sistema operacional.');
    }

    resumo() {
      return 'Notebook · SO: ' + this.#sistemaOperacional;
    }
  }

  class Projetor extends Equipamento {
    #lumens;

    constructor(patrimonio, nome, lumens) {
      super(patrimonio, nome);
      const valor = Number(lumens);
      if (!Number.isInteger(valor) || valor <= 0) throw new Error('Lumens deve ser um inteiro positivo.');
      this.#lumens = valor;
    }

    resumo() {
      return 'Projetor · ' + this.#lumens + ' lumens';
    }
  }

  // A coleção fica privada; quem usa Armario só chama operações autorizadas.
  class Armario {
    #equipamentos = [];

    adicionar(equipamento) {
      const repetido = this.#equipamentos.some(
        (item) => item.patrimonio.toLocaleLowerCase('pt-BR') === equipamento.patrimonio.toLocaleLowerCase('pt-BR')
      );
      if (repetido) throw new Error('Já existe um equipamento com esse patrimônio.');
      this.#equipamentos.push(equipamento);
    }

    remover(patrimonio) {
      const index = this.#equipamentos.findIndex((item) => item.patrimonio === patrimonio);
      if (index < 0) return false;
      this.#equipamentos.splice(index, 1);
      return true;
    }

    buscar(patrimonio) {
      return this.#equipamentos.find((item) => item.patrimonio === patrimonio);
    }

    listar() {
      return [...this.#equipamentos];
    }

    get quantidade() {
      return this.#equipamentos.length;
    }
  }

  const armario = new Armario();
  const form = document.querySelector('#equipment-form');
  const typeInput = document.querySelector('#equipment-type');
  const assetInput = document.querySelector('#asset-id');
  const nameInput = document.querySelector('#equipment-name');
  const specInput = document.querySelector('#equipment-spec');
  const specLabel = document.querySelector('#spec-label');
  const specHint = document.querySelector('#spec-hint');
  const equipmentList = document.querySelector('#equipment-list');
  const formStatus = document.querySelector('#form-status');
  const inventoryStatus = document.querySelector('#inventory-status');

  // Exemplos fictícios deixam os objetos e a sobrescrita visíveis desde a abertura.
  armario.adicionar(new Notebook('NT-014', 'Notebook de laboratório', 'Ubuntu'));
  armario.adicionar(new Projetor('PJ-006', 'Projetor da sala', 3200));

  function updateTypeHint() {
    const isNotebook = typeInput.value === 'notebook';
    specLabel.textContent = isNotebook ? 'Sistema operacional' : 'Lumens';
    specInput.placeholder = isNotebook ? 'Ex.: Linux' : 'Ex.: 3200';
    specHint.textContent = isNotebook
      ? 'Atributo específico da classe Notebook.'
      : 'Informe a potência luminosa como número inteiro.';
  }

  // Cria uma instância da subclasse selecionada e guarda-a pela interface do Armario.
  function addEquipment(event) {
    event.preventDefault();
    formStatus.classList.remove('success', 'error');

    try {
      const equipment = typeInput.value === 'notebook'
        ? new Notebook(assetInput.value, nameInput.value, specInput.value)
        : new Projetor(assetInput.value, nameInput.value, specInput.value);

      armario.adicionar(equipment);
      render();
      formStatus.textContent = equipment.nome + ' foi adicionado ao armário.';
      formStatus.classList.add('success');
      form.reset();
      updateTypeHint();
      assetInput.focus();
    } catch (error) {
      formStatus.textContent = error.message;
      formStatus.classList.add('error');
    }
  }

  // Cria elementos DOM e usa textContent para exibir dados sem interpretar HTML digitado.
  function render() {
    const items = armario.listar();
    equipmentList.replaceChildren();
    document.querySelector('#inventory-count').textContent = String(armario.quantidade);
    document.querySelector('#empty-state').hidden = items.length !== 0;

    items.forEach((equipment) => {
      const item = document.createElement('li');
      item.className = 'equipment-card';

      const info = document.createElement('div');
      info.className = 'equipment-info';
      const title = document.createElement('h3');
      title.textContent = equipment.nome;
      const detail = document.createElement('p');
      detail.textContent = '[' + equipment.patrimonio + '] ' + equipment.resumo();
      const state = document.createElement('span');
      state.className = 'state-pill' + (equipment.ligado ? ' is-on' : '');
      state.textContent = equipment.ligado ? 'Ligado' : 'Desligado';
      info.append(title, detail, state);

      const actions = document.createElement('div');
      actions.className = 'card-actions';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'secondary';
      toggle.dataset.action = 'toggle';
      toggle.dataset.patrimonio = equipment.patrimonio;
      toggle.textContent = equipment.ligado ? 'Desligar' : 'Ligar';
      toggle.setAttribute('aria-label', (equipment.ligado ? 'Desligar ' : 'Ligar ') + equipment.nome);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-button';
      remove.dataset.action = 'remove';
      remove.dataset.patrimonio = equipment.patrimonio;
      remove.textContent = 'Remover';
      remove.setAttribute('aria-label', 'Remover ' + equipment.nome);
      actions.append(toggle, remove);
      item.append(info, actions);
      equipmentList.append(item);
    });
  }

  // Delegação de eventos: os botões dos cartões usam o mesmo listener da lista.
  equipmentList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const equipment = armario.buscar(button.dataset.patrimonio);
    if (!equipment) return;

    if (button.dataset.action === 'toggle') {
      equipment.ligado ? equipment.desligar() : equipment.ligar();
      inventoryStatus.textContent = equipment.nome + ': ' + (equipment.ligado ? 'ligado.' : 'desligado.');
    } else if (button.dataset.action === 'remove') {
      armario.remover(equipment.patrimonio);
      inventoryStatus.textContent = equipment.nome + ' foi removido do armário.';
    }
    render();
  });

  typeInput.addEventListener('change', updateTypeHint);
  form.addEventListener('submit', addEquipment);
  updateTypeHint();
  render();
})();
