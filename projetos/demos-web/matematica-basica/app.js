const format = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 });

function showResult(element, label, value, calculation) {
  element.replaceChildren();
  const labelNode = document.createElement('span');
  labelNode.textContent = label;
  const valueNode = document.createElement('strong');
  valueNode.textContent = value;
  const calculationNode = document.createElement('small');
  calculationNode.textContent = calculation;
  element.append(labelNode, valueNode, calculationNode);
}

function showError(element, message) {
  showResult(element, 'Não foi possível calcular', message, 'Confira os valores informados.');
  element.classList.add('error');
}

function clearError(element) {
  element.classList.remove('error');
}

document.querySelector('#arithmetic-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const a = Number(form.get('a'));
  const b = Number(form.get('b'));
  const operation = form.get('operation');
  const result = document.querySelector('#arithmetic-result');
  clearError(result);
  if (operation === 'divide' && b === 0) return showError(result, 'Divisão por zero');
  const operations = {
    add: [a + b, '+'],
    subtract: [a - b, '−'],
    multiply: [a * b, '×'],
    divide: [a / b, '÷']
  };
  const [value, symbol] = operations[operation];
  showResult(result, 'Resultado', format.format(value), `${format.format(a)} ${symbol} ${format.format(b)}`);
});

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

document.querySelector('#fraction-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const n1 = Number(form.get('n1'));
  const d1 = Number(form.get('d1'));
  const n2 = Number(form.get('n2'));
  const d2 = Number(form.get('d2'));
  const operation = form.get('operation');
  const result = document.querySelector('#fraction-result');
  clearError(result);
  if (![n1, d1, n2, d2].every(Number.isInteger)) return showError(result, 'Use números inteiros');
  if (d1 === 0 || d2 === 0) return showError(result, 'Denominador não pode ser zero');
  if (operation === 'divide' && n2 === 0) return showError(result, 'Divisor não pode ser zero');

  let numerator, denominator;
  if (operation === 'add' || operation === 'subtract') {
    const sign = operation === 'add' ? 1 : -1;
    numerator = n1 * d2 + sign * n2 * d1;
    denominator = d1 * d2;
  } else if (operation === 'multiply') {
    numerator = n1 * n2;
    denominator = d1 * d2;
  } else {
    numerator = n1 * d2;
    denominator = d1 * n2;
  }
  if (denominator < 0) { numerator *= -1; denominator *= -1; }
  const divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;
  const simplified = denominator === 1 ? String(numerator) : `${numerator}/${denominator}`;
  const symbol = { add: '+', subtract: '−', multiply: '×', divide: '÷' }[operation];
  showResult(result, 'Resultado simplificado', simplified, `${n1}/${d1} ${symbol} ${n2}/${d2}`);
});

document.querySelector('#percent-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const percent = Number(form.get('percent'));
  const base = Number(form.get('base'));
  const result = document.querySelector('#percent-result');
  clearError(result);
  const value = percent / 100 * base;
  showResult(result, `${format.format(percent)}% de ${format.format(base)}`, format.format(value), `${format.format(percent)} ÷ 100 × ${format.format(base)}`);
});

document.querySelector('#proportion-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const a = Number(form.get('a'));
  const b = Number(form.get('b'));
  const c = Number(form.get('c'));
  const result = document.querySelector('#proportion-result');
  clearError(result);
  if (a === 0) return showError(result, 'A não pode ser zero');
  const x = b * c / a;
  showResult(result, 'Valor de X', format.format(x), `${format.format(a)}/${format.format(b)} = ${format.format(c)}/X → X = (${format.format(b)} × ${format.format(c)}) ÷ ${format.format(a)}`);
});
