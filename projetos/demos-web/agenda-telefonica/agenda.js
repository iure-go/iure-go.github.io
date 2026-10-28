(() => {
  const form = document.querySelector("#form-contato");
  const search = document.querySelector("#busca");
  const list = document.querySelector("#lista");
  const empty = document.querySelector("#estado-vazio");
  const count = document.querySelector("#contador");
  const formMessage = document.querySelector("#mensagem-form");
  const position = document.querySelector("#posicao");
  const selectedCard = document.querySelector("#cartao-navegacao");
  const previousButton = document.querySelector("#anterior");
  const nextButton = document.querySelector("#proximo");
  let contacts = [];
  let selectedId = null;

  function visibleContacts() {
    const query = search.value.trim().toLocaleLowerCase("pt-BR");
    return contacts.filter((contact) => contact.name.toLocaleLowerCase("pt-BR").includes(query));
  }

  function setFormMessage(text, kind = "") {
    formMessage.textContent = text;
    formMessage.className = `message${kind ? ` ${kind}` : ""}`;
  }

  function createField(label, value) {
    const line = document.createElement("p");
    line.className = "contact-meta";
    line.textContent = value ? `${label}: ${value}` : `${label}: não informado`;
    return line;
  }

  function renderSelected() {
    const index = contacts.findIndex((contact) => contact.id === selectedId);
    if (index < 0) {
      selectedCard.textContent = contacts.length ? "Selecione um contato na lista para navegar." : "Adicione um contato para começar a navegação.";
      position.textContent = "Nenhum contato selecionado";
      previousButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    const contact = contacts[index];
    position.textContent = `Contato ${index + 1} de ${contacts.length}`;
    selectedCard.replaceChildren();
    const title = document.createElement("h3");
    title.textContent = contact.name;
    selectedCard.append(title, createField("Telefone", contact.phone), createField("Nascimento", contact.birth), createField("E-mail", contact.email));
    previousButton.disabled = contacts.length < 2;
    nextButton.disabled = contacts.length < 2;
  }

  function renderList() {
    const visible = visibleContacts();
    count.textContent = `${contacts.length} ${contacts.length === 1 ? "contato" : "contatos"}`;
    empty.hidden = visible.length > 0;
    empty.textContent = contacts.length === 0 ? "Nenhum contato cadastrado ainda." : "Nenhum contato corresponde à busca.";
    list.replaceChildren();

    for (const contact of visible) {
      const item = document.createElement("li");
      item.className = `contact-item${contact.id === selectedId ? " selected" : ""}`;
      const top = document.createElement("div");
      top.className = "contact-top";
      const details = document.createElement("div");
      const name = document.createElement("p");
      name.className = "contact-name";
      name.textContent = contact.name;
      details.append(name, createField("Telefone", contact.phone));
      const actions = document.createElement("div");
      actions.className = "item-actions";
      const select = document.createElement("button");
      select.type = "button";
      select.className = "secondary";
      select.textContent = "Ver";
      select.setAttribute("aria-label", `Ver contato ${contact.name}`);
      select.addEventListener("click", () => {
        selectedId = contact.id;
        renderList();
        renderSelected();
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove";
      remove.textContent = "Remover";
      remove.setAttribute("aria-label", `Remover contato ${contact.name}`);
      remove.addEventListener("click", () => removeContact(contact.id));
      actions.append(select, remove);
      top.append(details, actions);
      item.append(top);
      list.append(item);
    }
    renderSelected();
  }

  function removeContact(id) {
    const index = contacts.findIndex((contact) => contact.id === id);
    contacts = contacts.filter((contact) => contact.id !== id);
    if (selectedId === id) selectedId = contacts.length ? contacts[Math.min(index, contacts.length - 1)].id : null;
    renderList();
    setFormMessage("Contato removido da sessão.", "success");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get("nome") || "").trim();
    const phone = String(formData.get("telefone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    if (!name || !phone) {
      setFormMessage("Preencha pelo menos nome e telefone.", "error");
      return;
    }
    if (email && !form.elements.email.validity.valid) {
      setFormMessage("Informe um e-mail válido ou deixe o campo em branco.", "error");
      form.elements.email.focus();
      return;
    }

    const contact = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      phone,
      birth: String(formData.get("nascimento") || ""),
      email
    };
    contacts.push(contact);
    selectedId = contact.id;
    form.reset();
    renderList();
    setFormMessage("Contato adicionado à sessão.", "success");
    form.elements.nome.focus();
  });

  search.addEventListener("input", renderList);
  document.querySelector("#limpar-todos").addEventListener("click", () => {
    contacts = [];
    selectedId = null;
    renderList();
    setFormMessage("Agenda limpa. Os dados foram removidos desta sessão.", "success");
  });
  previousButton.addEventListener("click", () => moveSelection(-1));
  nextButton.addEventListener("click", () => moveSelection(1));

  function moveSelection(direction) {
    if (contacts.length < 2) return;
    let index = contacts.findIndex((contact) => contact.id === selectedId);
    index = (index + direction + contacts.length) % contacts.length;
    selectedId = contacts[index].id;
    renderList();
  }

  renderList();
})();