(() => {
  const MAX_TERMS = 20;
  const MAX_COEFFICIENT = 10000n;
  const MAX_EXPONENT = 20;
  const p1Input = document.querySelector("#entrada-p1");
  const p2Input = document.querySelector("#entrada-p2");
  const p1Output = document.querySelector("#saida-p1");
  const p2Output = document.querySelector("#saida-p2");
  const resultOutput = document.querySelector("#resultado");
  const message = document.querySelector("#mensagem");
  const sumButton = document.querySelector("#somar");
  const multiplyButton = document.querySelector("#multiplicar");
  const xInput = document.querySelector("#valor-x");

  let p1 = null;
  let p2 = null;

  function parsePolynomial(text) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) throw new Error("Informe pelo menos um termo.");
    if (lines.length > MAX_TERMS) throw new Error(`Use no máximo ${MAX_TERMS} termos.`);

    const terms = new Map();
    for (let index = 0; index < lines.length; index++) {
      const parts = lines[index].split(",").map((part) => part.trim());
      if (parts.length !== 2 || !/^[+-]?\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) {
        throw new Error(`Linha ${index + 1}: use o formato coeficiente,expoente (ex.: -2,1).`);
      }

      const coefficient = BigInt(parts[0]);
      const exponent = Number(parts[1]);
      if (coefficient < -MAX_COEFFICIENT || coefficient > MAX_COEFFICIENT) {
        throw new Error(`Linha ${index + 1}: o coeficiente deve ficar entre -10.000 e 10.000.`);
      }
      if (!Number.isInteger(exponent) || exponent < 0 || exponent > MAX_EXPONENT) {
        throw new Error(`Linha ${index + 1}: o expoente deve ser um inteiro de 0 a ${MAX_EXPONENT}.`);
      }
      terms.set(exponent, (terms.get(exponent) || 0n) + coefficient);
    }

    return new Map([...terms.entries()].filter(([, coefficient]) => coefficient !== 0n).sort((a, b) => b[0] - a[0]));
  }

  function formatPolynomial(polynomial) {
    if (polynomial.size === 0) return "0";
    return [...polynomial.entries()].map(([exponent, coefficient], index) => {
      const negative = coefficient < 0n;
      const absolute = negative ? -coefficient : coefficient;
      let term;
      if (exponent === 0) term = absolute.toString();
      else {
        const variable = exponent === 1 ? "x" : `x^${exponent}`;
        term = `${absolute === 1n ? "" : absolute}${variable}`;
      }
      if (index === 0) return negative ? `−${term}` : term;
      return negative ? ` − ${term}` : ` + ${term}`;
    }).join("");
  }

  function showError(error) {
    message.textContent = error.message;
    message.className = "message error";
  }

  function updateOperationButtons() {
    const ready = p1 !== null && p2 !== null;
    sumButton.disabled = !ready;
    multiplyButton.disabled = !ready;
    document.querySelector("#form-avaliar button").disabled = !ready;
    if (!ready) resultOutput.textContent = "Crie P1 e P2 para habilitar as operações.";
  }

  function createPolynomial(input, output, which) {
    try {
      const polynomial = parsePolynomial(input.value);
      if (which === 1) p1 = polynomial;
      else p2 = polynomial;
      output.textContent = `P${which} = ${formatPolynomial(polynomial)}`;
      message.textContent = "Polinômio criado. Você já pode escolher uma operação.";
      message.className = "message";
      updateOperationButtons();
    } catch (error) {
      if (which === 1) p1 = null;
      else p2 = null;
      output.textContent = `P${which} ainda não criado.`;
      showError(error);
      updateOperationButtons();
    }
  }

  function combine(first, second, operation) {
    const result = new Map();
    for (const [exponent, coefficient] of first) {
      result.set(exponent, (result.get(exponent) || 0n) + coefficient);
    }
    for (const [exponent, coefficient] of second) {
      result.set(exponent, (result.get(exponent) || 0n) + coefficient);
    }
    return new Map([...result.entries()].filter(([, coefficient]) => coefficient !== 0n).sort((a, b) => b[0] - a[0]));
  }

  function multiply(first, second) {
    const result = new Map();
    for (const [firstExponent, firstCoefficient] of first) {
      for (const [secondExponent, secondCoefficient] of second) {
        const exponent = firstExponent + secondExponent;
        result.set(exponent, (result.get(exponent) || 0n) + firstCoefficient * secondCoefficient);
      }
    }
    return new Map([...result.entries()].filter(([, coefficient]) => coefficient !== 0n).sort((a, b) => b[0] - a[0]));
  }

  function evaluate(polynomial, x) {
    let value = 0n;
    const bigX = BigInt(x);
    for (const [exponent, coefficient] of polynomial) {
      value += coefficient * (bigX ** BigInt(exponent));
    }
    return value.toString();
  }

  document.querySelector("#criar-p1").addEventListener("click", () => createPolynomial(p1Input, p1Output, 1));
  document.querySelector("#criar-p2").addEventListener("click", () => createPolynomial(p2Input, p2Output, 2));
  sumButton.addEventListener("click", () => {
    if (p1 && p2) resultOutput.textContent = `P1 + P2 = ${formatPolynomial(combine(p1, p2))}`;
  });
  multiplyButton.addEventListener("click", () => {
    if (p1 && p2) resultOutput.textContent = `P1 × P2 = ${formatPolynomial(multiply(p1, p2))}`;
  });
  document.querySelector("#form-avaliar").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!p1 || !p2) return;
    const x = Number(xInput.value);
    if (!Number.isInteger(x) || x < -100 || x > 100) {
      showError(new Error("Informe um valor inteiro de x entre -100 e 100."));
      xInput.focus();
      return;
    }
    resultOutput.textContent = `P1(${x}) = ${evaluate(p1, x)} · P2(${x}) = ${evaluate(p2, x)}`;
    message.textContent = "Polinômios avaliados.";
    message.className = "message";
  });

  updateOperationButtons();
})();