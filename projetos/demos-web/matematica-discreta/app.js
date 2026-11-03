// GUIA DE EDIÇÃO: Operações com conjuntos, lógica e relações. parseSet normaliza conjuntos; renderTruthTable calcula proposições; relationProperties verifica propriedades.
const sortValues = values => [...new Set(values.map(value => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }));
const parseSet = value => sortValues(value.split(','));
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const setText = values => `{${values.length ? ` ${values.map(escapeHTML).join(', ')} ` : ''}}`;
const setBox = (label, values) => `<div><span>${label}</span><strong>${setText(values)}</strong></div>`;

document.querySelector('#sets-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const a = parseSet(form.get('a'));
  const b = parseSet(form.get('b'));
  const bSet = new Set(b);
  const aSet = new Set(a);
  const intersection = a.filter(value => bSet.has(value));
  const union = sortValues([...a, ...b]);
  const differenceAB = a.filter(value => !bSet.has(value));
  const differenceBA = b.filter(value => !aSet.has(value));
  document.querySelector('#sets-result').innerHTML = [
    setBox('A ∪ B · união', union),
    setBox('A ∩ B · interseção', intersection),
    setBox('A − B · diferença', differenceAB),
    setBox('B − A · diferença', differenceBA)
  ].join('');
});

const operators = {
  and: { symbol: 'P ∧ Q', label: 'E · conjunção', evaluate: (p, q) => p && q },
  or: { symbol: 'P ∨ Q', label: 'OU · disjunção inclusiva', evaluate: (p, q) => p || q },
  xor: { symbol: 'P ⊕ Q', label: 'OU exclusivo', evaluate: (p, q) => p !== q },
  implies: { symbol: 'P → Q', label: 'implicação', evaluate: (p, q) => !p || q },
  iff: { symbol: 'P ↔ Q', label: 'bicondicional', evaluate: (p, q) => p === q }
};
const truth = value => value ? 'V' : 'F';

// Gera as combinações das proposições e calcula o resultado do conectivo selecionado.
function renderTruthTable(operatorKey) {
  const operator = operators[operatorKey];
  const rows = [[true, true], [true, false], [false, true], [false, false]];
  const body = rows.map(([p, q]) => {
    const result = operator.evaluate(p, q);
    return `<tr><td>${truth(p)}</td><td>${truth(q)}</td><td class="${result ? 'true' : 'false'}">${truth(result)}</td></tr>`;
  }).join('');
  document.querySelector('#logic-result').innerHTML = `<table class="truth-table"><caption>${operator.symbol} · ${operator.label}</caption><thead><tr><th>P</th><th>Q</th><th>${operator.symbol}</th></tr></thead><tbody>${body}</tbody></table>`;
}

document.querySelector('#logic-form').addEventListener('submit', event => {
  event.preventDefault();
  renderTruthTable(new FormData(event.currentTarget).get('operator'));
});
document.querySelector('#logic-form select').addEventListener('change', event => renderTruthTable(event.target.value));

function parseRelation(setInput, pairInput) {
  const elements = parseSet(setInput);
  const elementSet = new Set(elements);
  const pairs = [];
  for (const rawPair of pairInput.split(',').map(pair => pair.trim()).filter(Boolean)) {
    const parts = rawPair.split('>').map(value => value.trim());
    if (parts.length !== 2 || !elementSet.has(parts[0]) || !elementSet.has(parts[1])) {
      throw new Error(`O par “${rawPair}” precisa estar no formato origem>destino e usar elementos do conjunto.`);
    }
    const key = JSON.stringify(parts);
    if (!pairs.some(pair => JSON.stringify(pair) === key)) pairs.push(parts);
  }
  return { elements, pairs, pairSet: new Set(pairs.map(pair => JSON.stringify(pair))) };
}

// Verifica propriedades da relação com base no conjunto de elementos e pares.
function relationProperties(elements, pairSet) {
  const has = (a, b) => pairSet.has(JSON.stringify([a, b]));
  const reflexive = elements.every(value => has(value, value));
  const symmetric = elements.every(a => elements.every(b => !has(a, b) || has(b, a)));
  const antisymmetric = elements.every(a => elements.every(b => a === b || !(has(a, b) && has(b, a))));
  const transitive = elements.every(a => elements.every(b => elements.every(c => !(has(a, b) && has(b, c)) || has(a, c))));
  return [
    ['Reflexiva', reflexive, 'Todo elemento se relaciona consigo mesmo.'],
    ['Simétrica', symmetric, 'Se (a,b) pertence a R, então (b,a) também pertence.'],
    ['Antissimétrica', antisymmetric, 'Se (a,b) e (b,a) pertencem a R, então a = b.'],
    ['Transitiva', transitive, 'Se (a,b) e (b,c) pertencem a R, então (a,c) também pertence.']
  ];
}

document.querySelector('#relation-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const result = document.querySelector('#relation-result');
  try {
    const { elements, pairs, pairSet } = parseRelation(form.get('set'), form.get('pairs'));
    if (!elements.length) throw new Error('Informe ao menos um elemento para o conjunto.');
    const properties = relationProperties(elements, pairSet);
    result.innerHTML = `<p class="relation-summary">R = {${pairs.map(([a, b]) => `(${escapeHTML(a)}, ${escapeHTML(b)})`).join(', ') || '∅'}}</p>${properties.map(([name, valid, explanation]) => `<div><span class="status ${valid ? 'yes' : 'no'}" aria-label="${valid ? 'Sim' : 'Não'}">${valid ? '✓' : '×'}</span><span><strong>${name}: ${valid ? 'sim' : 'não'}</strong><small>${explanation}</small></span></div>`).join('')}`;
    result.classList.remove('has-error');
  } catch (error) {
    result.innerHTML = `<p class="error-note">${escapeHTML(error.message)}</p>`;
    result.classList.add('has-error');
  }
});
