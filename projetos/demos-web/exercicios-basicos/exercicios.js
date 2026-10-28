(() => {
  const formatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 8 });

  function setOutput(element, text, kind = "success") {
    element.textContent = text;
    element.className = `result${kind ? ` ${kind}` : ""}`;
  }

  function readNumber(input) {
    if (input.value.trim() === "") return null;
    const value = Number(input.value);
    return Number.isFinite(value) ? value : null;
  }

  document.querySelector("#form-classificar").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#numero");
    const output = document.querySelector("#resultado-classificar");
    const value = readNumber(input);
    if (value === null) return setOutput(output, "Informe um número válido.", "error");
    const classification = value > 0 ? "positivo" : value < 0 ? "negativo" : "zero";
    setOutput(output, `${formatter.format(value)} é ${classification}.`);
  });

  document.querySelector("#form-somar").addEventListener("submit", (event) => {
    event.preventDefault();
    const first = readNumber(document.querySelector("#parcela-a"));
    const second = readNumber(document.querySelector("#parcela-b"));
    const output = document.querySelector("#resultado-soma");
    if (first === null || second === null) return setOutput(output, "Informe dois números válidos.", "error");
    const sum = first + second;
    if (!Number.isFinite(sum)) return setOutput(output, "A soma está fora do intervalo numérico suportado.", "error");
    setOutput(output, `${formatter.format(first)} + ${formatter.format(second)} = ${formatter.format(sum)}.`);
  });

  document.querySelector("#form-fatorial").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#fatorial");
    const output = document.querySelector("#resultado-fatorial");
    const value = readNumber(input);
    if (value === null || !Number.isInteger(value) || value < 0 || value > 18) {
      return setOutput(output, "Informe um inteiro de 0 a 18.", "error");
    }
    let result = 1;
    for (let factor = 2; factor <= value; factor++) result *= factor;
    setOutput(output, `${value}! = ${formatter.format(result)}.`);
  });
})();