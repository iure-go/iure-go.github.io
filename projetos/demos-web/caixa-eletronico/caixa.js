(() => {
  const form = document.querySelector("#form-transacao");
  const entrada = document.querySelector("#valor");
  const saldoTela = document.querySelector("#saldo");
  const mensagem = document.querySelector("#mensagem");
  const consultar = document.querySelector("#consultar");
  const reiniciar = document.querySelector("#reiniciar");
  const formatoMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  let saldoCentavos = 0;

  function atualizarSaldo() {
    saldoTela.textContent = formatoMoeda.format(saldoCentavos / 100);
  }

  function mostrarMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.className = `message${tipo ? ` ${tipo}` : ""}`;
  }

  function lerValorEmCentavos() {
    const valor = Number(entrada.value);
    if (!Number.isFinite(valor) || valor <= 0) return null;
    const centavos = Math.round(valor * 100);
    if (!Number.isSafeInteger(centavos) || centavos <= 0) return null;
    return centavos;
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const valor = lerValorEmCentavos();
    if (valor === null) {
      mostrarMensagem("Informe um valor positivo válido, como 25,50.", "error");
      entrada.focus();
      return;
    }

    const operacao = evento.submitter?.value;
    if (operacao === "deposito") {
      if (!Number.isSafeInteger(saldoCentavos + valor)) {
        mostrarMensagem("Esse valor ultrapassa o limite desta demonstração.", "error");
        entrada.value = "";
        entrada.focus();
        return;
      }
      saldoCentavos += valor;
      atualizarSaldo();
      mostrarMensagem(`Depósito de ${formatoMoeda.format(valor / 100)} realizado.`, "success");
    } else if (operacao === "saque") {
      if (valor > saldoCentavos) {
        mostrarMensagem("Saldo insuficiente. O saque não foi realizado.", "error");
      } else {
        saldoCentavos -= valor;
        atualizarSaldo();
        mostrarMensagem(`Saque de ${formatoMoeda.format(valor / 100)} realizado.`, "success");
      }
    }

    entrada.value = "";
    entrada.focus();
  });

  consultar.addEventListener("click", () => {
    mostrarMensagem(`Seu saldo atual é ${formatoMoeda.format(saldoCentavos / 100)}.`);
  });

  reiniciar.addEventListener("click", () => {
    saldoCentavos = 0;
    atualizarSaldo();
    entrada.value = "";
    mostrarMensagem("Simulador reiniciado. O saldo voltou a R$ 0,00.");
  });

  atualizarSaldo();
})();
