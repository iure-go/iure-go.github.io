(() => {
  const MAX_POSITIONS = 12;
  const sizeInput = document.querySelector("#quantidade");
  const mallocButton = document.querySelector("#alocar-malloc");
  const callocButton = document.querySelector("#alocar-calloc");
  const freeButton = document.querySelector("#liberar");
  const state = document.querySelector("#allocation-state");
  const cellsElement = document.querySelector("#cells");
  const message = document.querySelector("#mensagem");
  let memory = null;
  let allocationMethod = "";

  function showMessage(text, kind = "") {
    message.textContent = text;
    message.className = `message${kind ? ` ${kind}` : ""}`;
  }

  function setControls() {
    const allocated = memory !== null;
    sizeInput.disabled = allocated;
    mallocButton.disabled = allocated;
    callocButton.disabled = allocated;
    freeButton.disabled = !allocated;
  }

  function renderCells() {
    cellsElement.replaceChildren();
    if (memory === null) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "As posições aparecerão aqui depois da alocação.";
      cellsElement.append(empty);
      state.textContent = "Nenhum vetor alocado.";
      setControls();
      return;
    }

    state.textContent = `Vetor com ${memory.length} posição(ões), criado com ${allocationMethod}.`;
    memory.forEach((value, index) => {
      const card = document.createElement("article");
      card.className = "cell";
      const heading = document.createElement("div");
      heading.className = "cell-head";
      const indexLabel = document.createElement("span");
      indexLabel.textContent = `Índice ${index}`;
      const kindLabel = document.createElement("span");
      kindLabel.textContent = "int ilustrativo";
      heading.append(indexLabel, kindLabel);

      const cellValue = document.createElement("div");
      cellValue.className = `cell-value${value === null ? " unknown" : ""}`;
      cellValue.textContent = value === null ? "indeterminado (não ler)" : String(value);
      card.append(heading, cellValue);

      const controls = document.createElement("div");
      controls.className = "cell-controls";
      const input = document.createElement("input");
      input.type = "number";
      input.step = "1";
      input.placeholder = "Novo inteiro";
      input.setAttribute("aria-label", `Valor para gravar no índice ${index}`);
      const writeButton = document.createElement("button");
      writeButton.type = "button";
      writeButton.textContent = "Gravar";
      writeButton.addEventListener("click", () => {
        if (input.value.trim() === "" || !Number.isSafeInteger(Number(input.value))) {
          showMessage("Digite um número inteiro válido para gravar.", "error");
          input.focus();
          return;
        }
        memory[index] = Number(input.value);
        showMessage(`Valor gravado na posição ${index}.`, "success");
        renderCells();
      });
      controls.append(input, writeButton);
      card.append(controls);
      cellsElement.append(card);
    });
    setControls();
  }

  function allocate(method) {
    const count = Number(sizeInput.value);
    if (!Number.isInteger(count) || count < 1 || count > MAX_POSITIONS) {
      showMessage(`Escolha um tamanho inteiro entre 1 e ${MAX_POSITIONS}.`, "error");
      sizeInput.focus();
      return;
    }
    memory = Array.from({ length: count }, () => method === "calloc" ? 0 : null);
    allocationMethod = method;
    showMessage(method === "calloc"
      ? "Vetor alocado; as posições foram inicializadas com zero."
      : "Vetor alocado. O conteúdo de malloc é indeterminado; grave antes de ler.", "success");
    renderCells();
  }

  mallocButton.addEventListener("click", () => allocate("malloc"));
  callocButton.addEventListener("click", () => allocate("calloc"));
  freeButton.addEventListener("click", () => {
    memory = null;
    allocationMethod = "";
    showMessage("Memória liberada com free.", "success");
    renderCells();
  });

  renderCells();
})();