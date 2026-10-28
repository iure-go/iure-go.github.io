(() => {
  const LIMITE = 100;
  const form = document.querySelector("#form-palpite");
  const entrada = document.querySelector("#palpite");
  const mensagem = document.querySelector("#mensagem");
  const contador = document.querySelector("#contador");
  const reiniciar = document.querySelector("#reiniciar");

  let segredo;
  let tentativas;
  let encerrado;

  function novoJogo() {
    segredo = Math.floor(Math.random() * LIMITE) + 1;
    tentativas = 0;
    encerrado = false;
    contador.textContent = "0";
    mensagem.textContent = "Digite um número de 1 a 100 para começar.";
    mensagem.className = "message";
    entrada.value = "";
    entrada.disabled = false;
    form.querySelector("button[type='submit']").disabled = false;
    entrada.focus();
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (encerrado) return;

    const valor = Number(entrada.value);
    if (!Number.isInteger(valor) || valor < 1 || valor > LIMITE) {
      mensagem.textContent = "Digite um número inteiro entre 1 e 100.";
      mensagem.className = "message error";
      entrada.focus();
      return;
    }

    tentativas += 1;
    contador.textContent = String(tentativas);
    entrada.value = "";

    if (valor === segredo) {
      mensagem.textContent = `Acertou! O número era ${segredo}. Você precisou de ${tentativas} tentativa(s).`;
      mensagem.className = "message success";
      encerrado = true;
      entrada.disabled = true;
      form.querySelector("button[type='submit']").disabled = true;
    } else {
      mensagem.textContent = valor < segredo ? "O número secreto é maior. Tente novamente." : "O número secreto é menor. Tente novamente.";
      mensagem.className = "message";
      entrada.focus();
    }
  });

  reiniciar.addEventListener("click", novoJogo);
  novoJogo();
})();

