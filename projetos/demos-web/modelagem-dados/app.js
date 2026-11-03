// GUIA DE EDIÇÃO: Laboratório SQL com dados fictícios e interpretador limitado. tokenizeSQL/parseSQL interpretam o subconjunto; executeQuery roda consultas suportadas.
const entityDescriptions = {
  Aluno: ['Aluno', 'Representa a pessoa que solicita empréstimos. A chave id_aluno identifica cada aluno; seu e-mail é único no sistema.'],
  'Empréstimo': ['Empréstimo', 'Registra a operação de retirada. id_aluno é uma FK: cada empréstimo pertence a um aluno, enquanto um aluno pode ter vários empréstimos.'],
  Equipamento: ['Equipamento', 'Representa um item do laboratório. id_categoria classifica o equipamento; o número de patrimônio identifica o bem físico.'],
  ItemEmpréstimo: ['Item do empréstimo', 'Tabela associativa entre EMPRESTIMO e EQUIPAMENTO. A PK composta impede que o mesmo equipamento seja repetido no mesmo empréstimo e armazena condições de retirada e devolução.'],
  Categoria: ['Categoria', 'Agrupa equipamentos semelhantes. Uma categoria pode classificar vários equipamentos; cada equipamento pertence a uma categoria.']
};

document.querySelectorAll('.entity').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.entity').forEach(item => item.classList.toggle('selected', item === button));
  const [title, description] = entityDescriptions[button.dataset.entity];
  document.querySelector('#entity-detail').innerHTML = `<strong>${title}</strong><p>${description}</p>`;
}));

const schemas = [
  {
    title: 'Tabela inicial (não normalizada)',
    explanation: 'Uma planilha reúne matrícula, dados do aluno, disciplina, professor e nota. Dados do aluno e da disciplina se repetem em várias linhas, criando risco de inconsistência.',
    tables: [{name:'MATRICULA_COMPLETA',fields:['id_aluno','nome_aluno','email_aluno','cod_disciplina','nome_disciplina','id_professor','nome_professor','nota']}],
    dependencies: ['(id_aluno, cod_disciplina) → nota','id_aluno → nome_aluno, email_aluno','cod_disciplina → nome_disciplina, id_professor','id_professor → nome_professor'],
    note: 'A chave candidata é composta: (id_aluno, cod_disciplina). Cada linha descreve a nota de um aluno em uma disciplina.'
  },
  {
    title: '1ª Forma Normal (1FN)',
    explanation: 'Cada célula contém um valor atômico e cada linha pode ser identificada. Uma lista de disciplinas ou notas dentro de uma única célula seria separada em linhas individuais.',
    tables: [{name:'MATRICULA',fields:['PK/FK id_aluno','PK/FK cod_disciplina','nome_aluno','email_aluno','nome_disciplina','id_professor','nome_professor','nota']}],
    dependencies: ['(id_aluno, cod_disciplina) → nota','id_aluno → nome_aluno, email_aluno','cod_disciplina → nome_disciplina, id_professor','id_professor → nome_professor'],
    note: 'Os atributos são atômicos, mas ainda há dependências parciais da chave composta: os dados do aluno dependem apenas de id_aluno e os dados da disciplina apenas de cod_disciplina.'
  },
  {
    title: '2ª Forma Normal (2FN)',
    explanation: 'Além da 1FN, cada atributo não chave depende da chave inteira, e não de apenas uma parte da chave composta. Dados do aluno e da disciplina vão para tabelas próprias.',
    tables: [
      {name:'ALUNO',fields:['PK id_aluno','nome_aluno','email_aluno']},
      {name:'DISCIPLINA',fields:['PK cod_disciplina','nome_disciplina','id_professor','nome_professor']},
      {name:'MATRICULA',fields:['PK/FK id_aluno','PK/FK cod_disciplina','nota']}
    ],
    dependencies: ['id_aluno → nome_aluno, email_aluno','cod_disciplina → nome_disciplina, id_professor, nome_professor','(id_aluno, cod_disciplina) → nota'],
    note: 'A nota depende da matrícula completa. Porém, em DISCIPLINA ainda existe dependência transitiva: cod_disciplina → id_professor → nome_professor.'
  },
  {
    title: '3ª Forma Normal (3FN)',
    explanation: 'Além da 2FN, atributos não chave não dependem transitivamente da chave. O nome do professor é separado porque depende do identificador do professor, não da disciplina diretamente.',
    tables: [
      {name:'ALUNO',fields:['PK id_aluno','nome_aluno','email_aluno']},
      {name:'PROFESSOR',fields:['PK id_professor','nome_professor']},
      {name:'DISCIPLINA',fields:['PK cod_disciplina','nome_disciplina','FK id_professor']},
      {name:'MATRICULA',fields:['PK/FK id_aluno','PK/FK cod_disciplina','nota']}
    ],
    dependencies: ['id_professor → nome_professor','cod_disciplina → nome_disciplina, id_professor','(id_aluno, cod_disciplina) → nota'],
    note: 'O modelo evita duplicar nome de aluno, disciplina e professor a cada matrícula. As FKs mantêm os vínculos entre as entidades.'
  }
];

let currentStep = 0;
const content = document.querySelector('#normalization-content');
function renderStep(index) {
  currentStep = Math.max(0, Math.min(schemas.length - 1, index));
  const step = schemas[currentStep];
  const tables = step.tables.map(table => `<article class="schema-table"><h4>${table.name}</h4><ul>${table.fields.map(field => `<li>${field.replace(/^(PK\/FK|PK|FK)\s/, '<b class="key-$1">$1</b> ')}</li>`).join('')}</ul></article>`).join('');
  const dependencies = step.dependencies.map(dependency => `<span class="dependency">${dependency}</span>`).join('');
  content.innerHTML = `<h3>${step.title}</h3><p>${step.explanation}</p><div class="schema-grid">${tables}</div><p class="dependency-title"><strong>Dependências funcionais em foco</strong></p><div>${dependencies}</div><p class="normalization-note">${step.note}</p>`;
  document.querySelectorAll('.step').forEach(button => {
    const selected = Number(button.dataset.step) === currentStep;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
  });
  document.querySelector('#prev-step').disabled = currentStep === 0;
  const next = document.querySelector('#next-step');
  next.disabled = currentStep === schemas.length - 1;
  next.textContent = currentStep === schemas.length - 1 ? 'Modelo final ✓' : 'Próxima etapa →';
}
document.querySelectorAll('.step').forEach(button => button.addEventListener('click', () => renderStep(Number(button.dataset.step))));
document.querySelector('#prev-step').addEventListener('click', () => renderStep(currentStep - 1));
document.querySelector('#next-step').addEventListener('click', () => renderStep(currentStep + 1));
renderStep(0);

const demoDatabase = {
  aluno: [
    { id_aluno: 1, nome: 'Ana Souza', email: 'ana.souza@exemplo.edu' },
    { id_aluno: 2, nome: 'Bruno Lima', email: 'bruno.lima@exemplo.edu' },
    { id_aluno: 3, nome: 'Carla Mendes', email: 'carla.mendes@exemplo.edu' }
  ],
  categoria: [
    { id_categoria: 1, nome: 'Áudio e vídeo' },
    { id_categoria: 2, nome: 'Informática' },
    { id_categoria: 3, nome: 'Instrumentos' }
  ],
  equipamento: [
    { id_equipamento: 11, id_categoria: 1, descricao: 'Projetor portátil', numero_patrimonio: 'AV-101' },
    { id_equipamento: 12, id_categoria: 2, descricao: 'Notebook de laboratório', numero_patrimonio: 'TI-204' },
    { id_equipamento: 13, id_categoria: 1, descricao: 'Microfone USB', numero_patrimonio: 'AV-118' },
    { id_equipamento: 14, id_categoria: 3, descricao: 'Multímetro digital', numero_patrimonio: 'EL-032' }
  ],
  emprestimo: [
    { id_emprestimo: 101, id_aluno: 1, data_retirada: '2026-10-20', data_prevista: '2026-11-03', status: 'Ativo' },
    { id_emprestimo: 102, id_aluno: 2, data_retirada: '2026-10-18', data_prevista: '2026-10-25', status: 'Atrasado' },
    { id_emprestimo: 103, id_aluno: 1, data_retirada: '2026-09-02', data_prevista: '2026-09-09', status: 'Devolvido' },
    { id_emprestimo: 104, id_aluno: 3, data_retirada: '2026-10-28', data_prevista: '2026-11-05', status: 'Ativo' }
  ],
  item_emprestimo: [
    { id_emprestimo: 101, id_equipamento: 11, condicao_retirada: 'Bom estado', condicao_devolucao: null },
    { id_emprestimo: 101, id_equipamento: 13, condicao_retirada: 'Bom estado', condicao_devolucao: null },
    { id_emprestimo: 102, id_equipamento: 12, condicao_retirada: 'Bom estado', condicao_devolucao: null },
    { id_emprestimo: 103, id_equipamento: 14, condicao_retirada: 'Bom estado', condicao_devolucao: 'Bom estado' },
    { id_emprestimo: 104, id_equipamento: 12, condicao_retirada: 'Bom estado', condicao_devolucao: null }
  ]
};

const queryExamples = {
  loans: `SELECT a.nome, e.status, e.data_prevista
FROM aluno AS a
INNER JOIN emprestimo AS e ON a.id_aluno = e.id_aluno
ORDER BY e.data_prevista;`,
  equipment: `SELECT eq.descricao, c.nome AS categoria, eq.numero_patrimonio
FROM equipamento eq
INNER JOIN categoria c ON eq.id_categoria = c.id_categoria
ORDER BY c.nome;`,
  active: `SELECT a.nome, e.id_emprestimo, e.data_prevista
FROM aluno a
INNER JOIN emprestimo e ON a.id_aluno = e.id_aluno
WHERE e.status = 'Ativo'
ORDER BY e.data_prevista;`,
  all: `SELECT id_aluno, nome, email
FROM aluno
ORDER BY nome;`
};

// Divide a consulta em tokens para a etapa de interpretação.
function tokenizeSQL(sql) {
  const source = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, ' ');
  const tokenPattern = /\s+|'(?:''|[^'])*'|"(?:""|[^"])*"|>=|<=|<>|!=|[=><.,*();]|[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?/gy;
  const tokens = [];
  let position = 0;
  while (position < source.length) {
    tokenPattern.lastIndex = position;
    const match = tokenPattern.exec(source);
    if (!match) throw new Error(`Não reconheci o trecho próximo de “${source.slice(position, position + 18)}”.`);
    position = tokenPattern.lastIndex;
    if (!/^\s+$/.test(match[0])) tokens.push(match[0]);
  }
  return tokens;
}

// Analisa o subconjunto de SELECT aceito e retorna a estrutura da consulta.
function parseSQL(sql) {
  const tokens = tokenizeSQL(sql);
  let i = 0;
  const peek = () => tokens[i];
  const take = () => tokens[i++];
  const isWord = word => (peek() || '').toLowerCase() === word.toLowerCase();
  const expectWord = word => { if (!isWord(word)) throw new Error(`Esperava a palavra ${word.toUpperCase()}.`); take(); };
  const expect = token => { if (take() !== token) throw new Error(`Esperava “${token}”.`); };
  const identifier = () => {
    const token = take();
    if (!token || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) throw new Error('Esperava um nome de tabela ou coluna.');
    return token.toLowerCase();
  };
  const columnReference = () => {
    const first = identifier();
    if (peek() === '.') { take(); return `${first}.${identifier()}`; }
    return first;
  };
  expectWord('select');
  const columns = [];
  do {
    let source;
    if (peek() === '*') { take(); source = '*'; }
    else source = columnReference();
    let label = source;
    if (isWord('as')) { take(); label = identifier(); }
    columns.push({ source, label });
    if (peek() !== ',') break;
    take();
  } while (true);
  expectWord('from');
  const baseTable = identifier();
  let baseAlias = baseTable;
  if (isWord('as')) { take(); baseAlias = identifier(); }
  else if (peek() && /^[A-Za-z_][A-Za-z0-9_]*$/.test(peek()) && !['inner','join','where','order','limit','on'].includes(peek().toLowerCase())) baseAlias = identifier();
  const joins = [];
  while (isWord('join') || isWord('inner')) {
    if (isWord('inner')) { take(); expectWord('join'); } else take();
    const table = identifier();
    let alias = table;
    if (isWord('as')) { take(); alias = identifier(); }
    else if (peek() && /^[A-Za-z_][A-Za-z0-9_]*$/.test(peek()) && !['on','join','where','order','limit'].includes(peek().toLowerCase())) alias = identifier();
    expectWord('on');
    const left = columnReference();
    expect('=');
    const right = columnReference();
    joins.push({ table, alias, left, right });
  }
  const conditions = [];
  if (isWord('where')) {
    take();
    do {
      const column = columnReference();
      let operator = (take() || '').toUpperCase();
      if (!['=', '!=', '<>', '>', '<', '>=', '<=', 'LIKE'].includes(operator)) throw new Error('Use =, !=, <>, <, >, <=, >= ou LIKE na cláusula WHERE.');
      const rawValue = take();
      if (!rawValue) throw new Error('Faltou o valor de comparação na cláusula WHERE.');
      let value;
      if (rawValue.startsWith("'")) value = rawValue.slice(1, -1).replace(/''/g, "'");
      else if (rawValue.startsWith('"')) value = rawValue.slice(1, -1).replace(/""/g, '"');
      else if (/^-?\d+(?:\.\d+)?$/.test(rawValue)) value = Number(rawValue);
      else if (rawValue.toUpperCase() === 'NULL') value = null;
      else throw new Error('Valores de texto precisam estar entre aspas simples.');
      conditions.push({ column, operator, value });
      if (!isWord('and')) break;
      take();
    } while (true);
  }
  let order = null;
  if (isWord('order')) {
    take(); expectWord('by');
    const column = columnReference();
    const direction = isWord('desc') ? (take(), 'DESC') : (isWord('asc') ? (take(), 'ASC') : 'ASC');
    order = { column, direction };
  }
  let limit = null;
  if (isWord('limit')) {
    take();
    const value = take();
    if (!/^\d+$/.test(value || '')) throw new Error('LIMIT precisa ser um número inteiro não negativo.');
    limit = Number(value);
  }
  if (peek() === ';') take();
  if (i !== tokens.length) throw new Error(`Trecho não suportado perto de “${tokens[i]}”.`);
  return { columns, baseTable, baseAlias, joins, conditions, order, limit };
}

function readColumn(sources, reference) {
  const parts = reference.split('.');
  if (parts.length === 2) {
    const row = sources[parts[0]];
    if (!row) throw new Error(`Alias “${parts[0]}” não existe nesta consulta.`);
    if (!(parts[1] in row)) throw new Error(`Coluna “${reference}” não existe.`);
    return row[parts[1]];
  }
  const matches = Object.values(sources).filter(row => reference in row);
  if (!matches.length) throw new Error(`Coluna “${reference}” não existe.`);
  if (matches.length > 1) throw new Error(`A coluna “${reference}” é ambígua; use o alias da tabela, por exemplo a.${reference}.`);
  return matches[0][reference];
}

function compareValues(left, operator, right) {
  if (operator === 'LIKE') {
    const pattern = String(right).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
    return new RegExp(`^${pattern}$`, 'i').test(String(left ?? ''));
  }
  if (operator === '=' ) return left === right;
  if (operator === '!=' || operator === '<>') return left !== right;
  if (left === null || left === undefined || right === null) return false;
  if (typeof left === 'number' && typeof right === 'number') {
    if (operator === '>') return left > right;
    if (operator === '<') return left < right;
    if (operator === '>=') return left >= right;
    if (operator === '<=') return left <= right;
  }
  const a = String(left).toLocaleLowerCase('pt-BR');
  const b = String(right).toLocaleLowerCase('pt-BR');
  if (operator === '>') return a > b;
  if (operator === '<') return a < b;
  if (operator === '>=') return a >= b;
  if (operator === '<=') return a <= b;
  return false;
}

// Executa a consulta interpretada sobre os dados fictícios deste laboratório.
function executeQuery(sql) {
  const query = parseSQL(sql);
  const baseRows = demoDatabase[query.baseTable];
  if (!baseRows) throw new Error(`A tabela “${query.baseTable}” não existe. Tabelas: ${Object.keys(demoDatabase).join(', ')}.`);
  let rows = baseRows.map(row => ({ [query.baseAlias]: row }));
  for (const join of query.joins) {
    const joinRows = demoDatabase[join.table];
    if (!joinRows) throw new Error(`A tabela “${join.table}” não existe.`);
    const joined = [];
    for (const sources of rows) for (const joinRow of joinRows) {
      const candidate = { ...sources, [join.alias]: joinRow };
      if (readColumn(candidate, join.left) === readColumn(candidate, join.right)) joined.push(candidate);
    }
    rows = joined;
  }
  rows = rows.filter(sources => query.conditions.every(condition => compareValues(readColumn(sources, condition.column), condition.operator, condition.value)));
  if (query.order) {
    rows.sort((left, right) => {
      const a = readColumn(left, query.order.column), b = readColumn(right, query.order.column);
      const result = typeof a === 'number' && typeof b === 'number' ? a - b : String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
      return query.order.direction === 'DESC' ? -result : result;
    });
  }
  if (query.limit !== null) rows = rows.slice(0, query.limit);
  const selected = query.columns.length === 1 && query.columns[0].source === '*'
    ? Object.entries(rows[0] || {}).flatMap(([alias, row]) => Object.keys(row).map(key => ({ source: `${alias}.${key}`, label: `${alias}.${key}` })))
    : query.columns;
  if (!selected.length) throw new Error('A consulta não retornou colunas. Confira o SELECT ou remova o * quando não houver linhas.');
  const resultRows = rows.map(sources => selected.map(column => readColumn(sources, column.source)));
  return { columns: selected.map(column => column.label), rows: resultRows };
}

function showQueryResult(result) {
  const target = document.querySelector('#query-result');
  target.replaceChildren();
  const summary = document.createElement('p');
  summary.className = 'query-summary';
  summary.textContent = `${result.rows.length} ${result.rows.length === 1 ? 'linha encontrada' : 'linhas encontradas'}`;
  target.append(summary);
  if (!result.rows.length) {
    const empty = document.createElement('div');
    empty.className = 'result-placeholder';
    empty.textContent = 'Nenhum registro corresponde aos filtros desta consulta.';
    target.append(empty);
    return;
  }
  const wrap = document.createElement('div');
  wrap.className = 'result-table-wrap';
  const table = document.createElement('table');
  table.className = 'result-table';
  const head = table.createTHead().insertRow();
  result.columns.forEach(column => { const th = document.createElement('th'); th.textContent = column; head.append(th); });
  const body = table.createTBody();
  result.rows.forEach(values => {
    const row = body.insertRow();
    values.forEach(value => { const cell = row.insertCell(); cell.textContent = value === null || value === undefined ? '—' : String(value); });
  });
  wrap.append(table);
  target.append(wrap);
}

function runQuery() {
  const target = document.querySelector('#query-result');
  try {
    showQueryResult(executeQuery(document.querySelector('#sql-editor').value));
    target.classList.remove('query-error');
  } catch (error) {
    target.classList.add('query-error');
    target.replaceChildren();
    const message = document.createElement('p');
    message.className = 'query-error-message';
    message.textContent = error.message;
    target.append(message);
  }
}

const sqlEditor = document.querySelector('#sql-editor');
document.querySelector('#run-query').addEventListener('click', runQuery);
document.querySelector('#reset-query').addEventListener('click', () => {
  const example = document.querySelector('#query-example').value;
  sqlEditor.value = queryExamples[example];
  runQuery();
});
document.querySelector('#query-example').addEventListener('change', event => {
  sqlEditor.value = queryExamples[event.target.value];
  runQuery();
});
sqlEditor.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); runQuery(); }
});
runQuery();
