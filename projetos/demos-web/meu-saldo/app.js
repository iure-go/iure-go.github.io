(() => {
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const categories = ["Alimentação", "Lazer", "Moradia", "Outros", "Transporte"];
  const transactions = [
    { id: 1, description: "Mercado", type: "expense", category: "Alimentação", cents: 15000, date: "2026-10-15" },
    { id: 2, description: "Salário", type: "income", category: "Outros", cents: 170000, date: "2026-10-15" },
    { id: 3, description: "Cinema", type: "expense", category: "Lazer", cents: 20000, date: "2026-10-15" },
    { id: 4, description: "Uber", type: "expense", category: "Transporte", cents: 7000, date: "2026-10-15" },
    { id: 5, description: "Aluguel", type: "expense", category: "Moradia", cents: 50000, date: "2026-10-15" },
    { id: 6, description: "Lanche", type: "expense", category: "Outros", cents: 12000, date: "2026-10-15" }
  ];
  let mode = "month";
  let reference = new Date(2026, 9, 15);
  let budgetCents = 200000;
  let typeFilter = "all";
  let showAll = false;
  let nextId = 7;

  const el = (selector) => document.querySelector(selector);
  const money = (cents) => currency.format(cents / 100);
  const dateFromString = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  const localDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const formatDate = (value) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(dateFromString(value));
  const titleCase = (text) => text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
  const monthLabel = (date) => titleCase(new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date));

  function interval() {
    const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
    const end = new Date(start);
    if (mode === "week") {
      const offset = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - offset);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 6);
    } else if (mode === "month") {
      start.setDate(1);
      end.setMonth(start.getMonth() + 1, 0);
    } else if (mode === "year") {
      start.setMonth(0, 1);
      end.setMonth(11, 31);
    }
    return { start, end };
  }

  function periodTransactions() {
    const { start, end } = interval();
    return transactions.filter((tx) => {
      const date = dateFromString(tx.date);
      return date >= start && date <= end;
    });
  }

  function periodText() {
    if (mode === "day") return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(reference);
    if (mode === "month") return monthLabel(reference);
    if (mode === "year") return String(reference.getFullYear());
    const { start, end } = interval();
    const startText = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(start);
    const endText = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(end);
    return `${startText}–${endText}`;
  }

  function totals(list) {
    return list.reduce((result, tx) => {
      result[tx.type] += tx.cents;
      return result;
    }, { income: 0, expense: 0 });
  }

  function expenseByCategory(list) {
    const sums = new Map(categories.map((category) => [category, 0]));
    list.filter((tx) => tx.type === "expense").forEach((tx) => sums.set(tx.category, (sums.get(tx.category) || 0) + tx.cents));
    return [...sums.entries()].filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]);
  }

  function renderCategories(list) {
    const rows = expenseByCategory(list);
    const host = el("#category-list");
    host.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Nenhuma saída neste período.";
      host.append(empty);
      return;
    }
    const highest = rows[0][1];
    rows.forEach(([category, amount]) => {
      const card = document.createElement("article");
      card.className = "category-item";
      const top = document.createElement("div");
      top.className = "category-top";
      const name = document.createElement("span");
      name.textContent = category;
      const value = document.createElement("span");
      value.className = "category-amount";
      value.textContent = money(amount);
      top.append(name, value);
      const track = document.createElement("div");
      track.className = "category-track";
      const fill = document.createElement("div");
      fill.className = "category-fill";
      fill.style.width = `${Math.max(3, amount / highest * 100)}%`;
      track.append(fill);
      card.append(top, track);
      host.append(card);
    });
  }

  function renderTransactions(list) {
    const category = el("#category-filter").value;
    let filtered = list.filter((tx) => (typeFilter === "all" || tx.type === typeFilter) && (category === "all" || tx.category === category));
    filtered.sort((a, b) => b.date.localeCompare(a.date) || a.id - b.id);
    el("#transaction-count").textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`;
    el("#transaction-list").replaceChildren();
    el("#empty-transactions").hidden = filtered.length > 0;
    const visible = showAll ? filtered : filtered.slice(0, 5);
    visible.forEach((tx) => {
      const row = document.createElement("article");
      row.className = "transaction-row";
      const details = document.createElement("div");
      const title = document.createElement("p");
      title.className = "tx-title";
      title.textContent = tx.description;
      const meta = document.createElement("p");
      meta.className = "tx-meta";
      meta.textContent = `${tx.category} · ${formatDate(tx.date)}`;
      details.append(title, meta);
      const amount = document.createElement("span");
      amount.className = `tx-amount ${tx.type}`;
      amount.textContent = `${tx.type === "income" ? "+" : "−"} ${money(tx.cents)}`;
      row.append(details, amount);
      el("#transaction-list").append(row);
    });
    if (filtered.length > 5) {
      const toggle = document.createElement("button");
      toggle.className = "text-button";
      toggle.type = "button";
      toggle.textContent = showAll ? "Mostrar menos" : `Ver todos (${filtered.length})`;
      toggle.addEventListener("click", () => { showAll = !showAll; renderTransactions(list); });
      el("#transaction-list").append(toggle);
    }
  }

  function renderReport(list, summary) {
    el("#report-summary").textContent = `Entradas ${money(summary.income)} · Saídas ${money(summary.expense)} · Saldo ${money(summary.income - summary.expense)}`;
    const host = el("#report-categories");
    host.replaceChildren();
    expenseByCategory(list).forEach(([category, amount]) => {
      const row = document.createElement("div");
      row.className = "report-row";
      const name = document.createElement("span");
      name.textContent = category;
      const value = document.createElement("strong");
      value.textContent = money(amount);
      row.append(name, value);
      host.append(row);
    });
  }

  function render() {
    const list = periodTransactions();
    const sum = totals(list);
    el("#period-heading").textContent = periodText();
    el("#period-label").textContent = periodText();
    el("#saldo-periodo").textContent = money(sum.income - sum.expense);
    el("#total-lancamentos").textContent = `${list.length} ${list.length === 1 ? "lançamento" : "lançamentos"}`;
    el("#entradas").textContent = money(sum.income);
    el("#saidas").textContent = money(sum.expense);
    const budgetPeriod = transactions.filter((tx) => {
      const date = dateFromString(tx.date);
      return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth() && tx.type === "expense";
    }).reduce((total, tx) => total + tx.cents, 0);
    el("#budget-text").textContent = `${money(budgetPeriod)} de ${money(budgetCents)}`;
    const percent = budgetCents > 0 ? Math.min(100, budgetPeriod / budgetCents * 100) : 0;
    el("#budget-progress").style.width = `${percent}%`;
    el(".progress-track").setAttribute("aria-valuenow", String(Math.round(percent)));
    renderCategories(list);
    renderTransactions(list);
    renderReport(list, sum);
    document.querySelectorAll(".period-tabs button").forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "true"); else button.removeAttribute("aria-current");
    });
  }

  document.querySelectorAll(".period-tabs button").forEach((button) => button.addEventListener("click", () => {
    mode = button.dataset.mode;
    showAll = false;
    render();
  }));
  el("#period-prev").addEventListener("click", () => shiftPeriod(-1));
  el("#period-next").addEventListener("click", () => shiftPeriod(1));
  function shiftPeriod(amount) {
    if (mode === "day") reference.setDate(reference.getDate() + amount);
    if (mode === "week") reference.setDate(reference.getDate() + amount * 7);
    if (mode === "month") reference.setMonth(reference.getMonth() + amount, 1);
    if (mode === "year") reference.setFullYear(reference.getFullYear() + amount);
    showAll = false;
    render();
  }
  document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
    typeFilter = button.dataset.type;
    document.querySelectorAll(".filter").forEach((filter) => filter.classList.toggle("active", filter === button));
    renderTransactions(periodTransactions());
  }));
  el("#category-filter").addEventListener("change", () => renderTransactions(periodTransactions()));

  const transactionDialog = el("#transaction-dialog");
  const budgetDialog = el("#budget-dialog");
  el("#abrir-lancamento").addEventListener("click", () => {
    el("#transaction-form").reset();
    el("#date-input").value = localDateString(reference);
    el("#transaction-error").textContent = "";
    transactionDialog.showModal();
  });
  el("#editar-limite").addEventListener("click", () => {
    el("#budget-input").value = (budgetCents / 100).toFixed(2);
    el("#budget-error").textContent = "";
    budgetDialog.showModal();
  });
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => el(`#${button.dataset.close}`).close()));

  el("#transaction-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const description = el("#description-input").value.trim();
    const amount = Number(el("#amount-input").value);
    const dateValue = el("#date-input").value;
    const cents = Math.round(amount * 100);
    if (!description || !Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(cents) || !dateValue) {
      el("#transaction-error").textContent = "Preencha a descrição, um valor positivo e uma data válida.";
      return;
    }
    transactions.push({
      id: nextId++, description, type: el("#type-input").value,
      category: el("#category-input").value, cents, date: dateValue
    });
    reference = dateFromString(dateValue);
    mode = "month";
    typeFilter = "all";
    showAll = false;
    document.querySelectorAll(".filter").forEach((button) => button.classList.toggle("active", button.dataset.type === "all"));
    el("#category-filter").value = "all";
    el("#transaction-form").reset();
    transactionDialog.close();
    render();
  });

  el("#budget-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(el("#budget-input").value);
    const cents = Math.round(amount * 100);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(cents)) {
      el("#budget-error").textContent = "Informe um limite positivo válido.";
      return;
    }
    budgetCents = cents;
    budgetDialog.close();
    render();
  });

  render();
})();
