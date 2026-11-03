// GUIA DE EDIÇÃO: laboratório de estatística descritiva. SAMPLE_DATA define o exemplo; parseData lê valores; summarize calcula medidas; renderHistogram desenha as frequências.
(() => {
  'use strict';

  // Troque estes valores para apresentar outro conjunto fictício inicial.
  const SAMPLE_DATA = '12, 15, 18, 18, 20, 22, 24, 25, 29, 37';
  const $ = (selector) => document.querySelector(selector);
  const form = $('#data-form');
  const input = $('#dataset');
  const status = $('#input-status');
  const sampleType = $('#variance-type');
  const binCount = $('#bin-count');
  const histogram = $('#histogram');

  // Formata resultados com convenções brasileiras sem impor zeros desnecessários.
  function formatNumber(value) {
    return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  // Aceita vírgula, ponto e vírgula ou quebra de linha como separadores.
  // Quando usar vírgula decimal, separe os valores com ponto e vírgula.
  function parseData(text) {
    const decimalCommaMode = /[;\n\r]/.test(text);
    const tokens = decimalCommaMode
      ? text.split(/[;\n\r]+/).flatMap((part) => part.trim().split(/\s+/))
      : text.split(/[,\s]+/);

    if (tokens.some((token) => token.trim() === '')) {
      throw new Error('Remova separadores extras ou valores vazios.');
    }

    const values = tokens.map((token) => {
      const normalized = decimalCommaMode ? token.replace(',', '.') : token;
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
        throw new Error('Use apenas números. Separe decimais com vírgula ou ponto conforme a dica.');
      }
      const value = Number(normalized);
      if (!Number.isFinite(value)) throw new Error('Todos os valores precisam ser números finitos.');
      if (Math.abs(value) > 1e9) throw new Error('Use valores entre -1.000.000.000 e 1.000.000.000 para manter os cálculos estáveis.');
      return value;
    });

    if (values.length < 2) throw new Error('Informe pelo menos dois valores para comparar as medidas.');
    if (values.length > 500) throw new Error('Use no máximo 500 observações nesta demonstração.');
    return values;
  }

  // Calcula um quantil por interpolação linear na lista ordenada.
  function quantile(sorted, proportion) {
    const position = (sorted.length - 1) * proportion;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    const fraction = position - lower;
    return sorted[lower] + (sorted[upper] - sorted[lower]) * fraction;
  }

  // Reúne medidas de centro, dispersão e posição para a amostra/popolação escolhida.
  function summarize(values, type) {
    const ordered = [...values].sort((a, b) => a - b);
    const n = ordered.length;
    const mean = values.reduce((sum, value) => sum + value, 0) / n;
    const middle = Math.floor(n / 2);
    const median = n % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;

    const frequencies = new Map();
    values.forEach((value) => frequencies.set(value, (frequencies.get(value) || 0) + 1));
    const highestFrequency = Math.max(...frequencies.values());
    const modes = highestFrequency > 1
      ? [...frequencies.entries()].filter(([, frequency]) => frequency === highestFrequency).map(([value]) => value)
      : [];

    const squaredDifferences = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
    const divisor = type === 'sample' ? n - 1 : n;
    const variance = squaredDifferences / divisor;

    return {
      n,
      mean,
      median,
      mode: modes,
      min: ordered[0],
      max: ordered[n - 1],
      range: ordered[n - 1] - ordered[0],
      variance,
      standardDeviation: Math.sqrt(variance),
      q1: quantile(ordered, 0.25),
      q3: quantile(ordered, 0.75),
    };
  }

  // Atualiza os cartões de estatística usando texto, sem inserir a entrada no HTML.
  function renderMetrics(stats, type) {
    $('#mean').textContent = formatNumber(stats.mean);
    $('#median').textContent = formatNumber(stats.median);
    $('#mode').textContent = stats.mode.length ? stats.mode.map(formatNumber).join(', ') : 'Sem moda';
    $('#count').textContent = String(stats.n);
    $('#minmax').textContent = formatNumber(stats.min) + ' – ' + formatNumber(stats.max);
    $('#range').textContent = formatNumber(stats.range);
    $('#variance').textContent = formatNumber(stats.variance);
    $('#stddev').textContent = formatNumber(stats.standardDeviation);
    $('#q1').textContent = formatNumber(stats.q1);
    $('#q3').textContent = formatNumber(stats.q3);

    const difference = Math.abs(stats.mean - stats.median);
    $('#interpretation').textContent = difference > stats.standardDeviation * 0.25
      ? 'A média e a mediana diferem. Observe se valores mais afastados estão influenciando a média.'
      : 'Neste conjunto, média e mediana estão próximas. Compare também a dispersão e o formato do histograma.';
    $('.subheading').textContent = type === 'sample'
      ? 'Dispersão e posição · variância amostral'
      : 'Dispersão e posição · variância populacional';
  }

  // Divide a amplitude em classes e constrói as barras usando elementos DOM seguros.
  function renderHistogram(values, requestedBins) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binTotal = min === max ? 1 : requestedBins;
    const width = binTotal === 1 ? 0 : (max - min) / binTotal;
    const bins = Array.from({ length: binTotal }, (_, index) => ({
      lower: min + index * width,
      upper: index === binTotal - 1 ? max : min + (index + 1) * width,
      count: 0,
    }));

    values.forEach((value) => {
      const index = width === 0 ? 0 : Math.min(binTotal - 1, Math.floor((value - min) / width));
      bins[index].count += 1;
    });

    const maxFrequency = Math.max(...bins.map((bin) => bin.count), 1);
    histogram.replaceChildren(...bins.map((bin, index) => {
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.setAttribute('role', 'listitem');

      const label = document.createElement('span');
      label.className = 'bar-label';
      label.textContent = width === 0
        ? formatNumber(min)
        : formatNumber(bin.lower) + (index === bins.length - 1 ? ' – ' : ' a ') + formatNumber(bin.upper);

      const track = document.createElement('div');
      track.className = 'bar-track';
      track.setAttribute('role', 'img');
      track.setAttribute('aria-label', label.textContent + ': ' + bin.count + ' observações');

      const fill = document.createElement('div');
      fill.className = 'bar-fill';
      fill.style.width = (bin.count / maxFrequency * 100) + '%';
      track.append(fill);

      const count = document.createElement('span');
      count.className = 'bar-count';
      count.textContent = String(bin.count);

      row.append(label, track, count);
      return row;
    }));

    $('#chart-total').textContent = values.length + (values.length === 1 ? ' observação' : ' observações');
  }

  // Coordena leitura, cálculos e atualização do resumo e do histograma.
  function analyze() {
    status.classList.remove('success');
    try {
      const values = parseData(input.value);
      const stats = summarize(values, sampleType.value);
      renderMetrics(stats, sampleType.value);
      renderHistogram(values, Number(binCount.value));
      status.textContent = 'Análise atualizada para ' + stats.n + ' observações.';
      status.classList.add('success');
    } catch (error) {
      status.textContent = error.message;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    analyze();
  });
  sampleType.addEventListener('change', analyze);
  binCount.addEventListener('change', analyze);

  $('#restore-sample').addEventListener('click', () => {
    input.value = SAMPLE_DATA;
    analyze();
    input.focus();
  });

  analyze();
})();