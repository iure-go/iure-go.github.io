/* BancoLab: simulação didática no navegador, sem conexão com um SGBD. */
(() => {
  "use strict";

  // Os registros iniciais são fictícios e mantidos somente na memória da página.
  const initialData = {
    students: [
      { id: 1, name: "Ana Souza", email: "ana.souza@exemplo.edu.br" },
      { id: 2, name: "Bruno Lima", email: "bruno.lima@exemplo.edu.br" },
      { id: 3, name: "Caio Mendes", email: "caio.mendes@exemplo.edu.br" }
    ],
    books: [
      { id: 1, isbn: "978-85-00001-01-1", title: "Introdução a Banco de Dados", author: "M. Costa" },
      { id: 2, isbn: "978-85-00001-02-8", title: "SQL: consultas e prática", author: "R. Almeida" },
      { id: 3, isbn: "978-85-00001-03-5", title: "Estruturas Relacionais", author: "L. Santos" },
      { id: 4, isbn: "978-85-00001-04-2", title: "Sistemas de Informação", author: "P. Oliveira" }
    ],
    loans: [
      { id: 101, studentId: 1, bookId: 1, loanDate: "2026-10-02", returnDate: "", status: "Aberto" },
      { id: 102, studentId: 2, bookId: 2, loanDate: "2026-10-05", returnDate: "2026-10-17", status: "Devolvido" },
      { id: 103, studentId: 3, bookId: 3, loanDate: "2026-10-08", returnDate: "", status: "Aberto" },
      { id: 104, studentId: 1, bookId: 4, loanDate: "2026-10-10", returnDate: "2026-10-20", status: "Devolvido" }
    ],
    nextLoanId: 105
  };

  let data = copy(initialData);
  let pending = [];
  let selectedTable = "loans";
  let lastStatements = [];
  let lastOutcome = "pending";

  const elements = {
    dataTable: document.querySelector("#data-table"),
    querySelect: document.querySelector("#query-select"),
    queryStudent: document.querySelector("#query-student"),
    studentFilter: document.querySelector("#student-filter"),
    queryCode: document.querySelector("#query-code"),
    queryTitle: document.querySelector("#query-title"),
    queryCount: document.querySelector("#query-count"),
    queryResult: document.querySelector("#query-result"),
    loanStudent: document.querySelector("#loan-student"),
    loanBook: document.querySelector("#loan-book"),
    returnLoan: document.querySelector("#return-loan"),
    pendingList: document.querySelector("#pending-list"),
    pendingCount: document.querySelector("#pending-count"),
    transactionCode: document.querySelector("#transaction-code"),
    transactionMessage: document.querySelector("#transaction-message"),
    transactionDot: document.querySelector("#transaction-dot"),
    commit: document.querySelector("#commit"),
    rollback: document.querySelector("#rollback")
  };

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function today() {
    const date = new Date();
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }

  function studentName(id, source = data) {
    return source.students.find((student) => student.id === id)?.name ?? "Estudante não encontrado";
  }

  function bookTitle(id, source = data) {
    return source.books.find((book) => book.id === id)?.title ?? "Livro não encontrado";
  }

  function isBookAvailable(bookId, source = data) {
    return !source.loans.some((loan) => loan.bookId === bookId && loan.status === "Aberto");
  }

  // Aplica uma operação em uma cópia. Se uma etapa falhar, a base real permanece intacta.
  function applyOperation(target, operation) {
    if (operation.type === "borrow") {
      const student = target.students.find((row) => row.id === operation.studentId);
      const book = target.books.find((row) => row.id === operation.bookId);
      if (!student || !book) throw new Error("A chave estrangeira deve apontar para uma pessoa e um livro existentes.");
      if (!student.name.trim() || !student.email.trim() || !book.title.trim()) {
        throw new Error("A operação viola um campo obrigatório (NOT NULL).");
      }
      if (target.loans.some((row) => row.bookId === book.id && row.status === "Aberto")) {
        throw new Error("O livro já possui um empréstimo em aberto. A regra de disponibilidade foi violada.");
      }
      const id = target.nextLoanId++;
      target.loans.push({ id, studentId: student.id, bookId: book.id, loanDate: today(), returnDate: "", status: "Aberto" });
      operation.appliedId = id;
      return `INSERT INTO emprestimo (id_emprestimo, id_estudante, id_livro, data_emprestimo, status)\nVALUES (${id}, ${student.id}, ${book.id}, '${today()}', 'Aberto');`;
    }

    const loan = target.loans.find((row) => row.id === operation.loanId);
    if (!loan) throw new Error("A chave estrangeira do empréstimo não foi encontrada.");
    if (loan.status !== "Aberto") throw new Error("Somente empréstimos em aberto podem ser devolvidos.");
    loan.status = "Devolvido";
    loan.returnDate = today();
    return `UPDATE emprestimo\nSET status = 'Devolvido', data_devolucao = '${today()}'\nWHERE id_emprestimo = ${loan.id};`;
  }

  function setMessage(message, kind = "") {
    elements.transactionMessage.textContent = message;
    elements.transactionMessage.className = `message ${kind}`.trim();
  }

  function renderTable(tableName) {
    selectedTable = tableName;
    document.querySelectorAll(".table-tab").forEach((button) => {
      const active = button.dataset.table === tableName;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const configs = {
      students: {
        headings: ["id_estudante · PK", "nome", "email · UNIQUE"],
        rows: data.students.map((row) => [row.id, row.name, row.email])
      },
      books: {
        headings: ["id_livro · PK", "isbn · UNIQUE", "titulo", "autor"],
        rows: data.books.map((row) => [row.id, row.isbn, row.title, row.author])
      },
      loans: {
        headings: ["id_emprestimo · PK", "estudante · FK", "livro · FK", "data_emprestimo", "status"],
        rows: data.loans.map((row) => [
          row.id, studentName(row.studentId), bookTitle(row.bookId), row.loanDate,
          `<span class="status ${row.status === "Devolvido" ? "returned" : ""}">${escapeHtml(row.status)}</span>`
        ])
      }
    };
    const config = configs[tableName];
    elements.dataTable.innerHTML = `<thead><tr>${config.headings.map((heading) => `<th>${escapeHtml(heading)}</th>`).join("")}</tr></thead><tbody>${config.rows.length ? config.rows.map((row) => `<tr>${row.map((cell) => `<td>${typeof cell === "string" && cell.startsWith("<span") ? cell : escapeHtml(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${config.headings.length}">Nenhum registro.</td></tr>`}</tbody>`;
  }

  function renderSelects() {
    const selectedStudent = elements.loanStudent.value;
    const selectedBook = elements.loanBook.value;
    const selectedReturn = elements.returnLoan.value;
    const selectedQueryStudent = elements.queryStudent.value;
    const option = (value, label) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;

    elements.loanStudent.innerHTML = data.students.map((student) => option(student.id, student.name)).join("");
    elements.queryStudent.innerHTML = data.students.map((student) => option(student.id, student.name)).join("");
    if (selectedStudent) elements.loanStudent.value = selectedStudent;
    if (selectedQueryStudent) elements.queryStudent.value = selectedQueryStudent;

    const availableBooks = data.books.filter((book) => isBookAvailable(book.id));
    elements.loanBook.innerHTML = availableBooks.length
      ? availableBooks.map((book) => option(book.id, book.title)).join("")
      : option("", "Nenhum livro disponível");
    if (availableBooks.some((book) => String(book.id) === selectedBook)) elements.loanBook.value = selectedBook;
    elements.loanBook.disabled = availableBooks.length === 0;

    const openLoans = data.loans.filter((loan) => loan.status === "Aberto");
    elements.returnLoan.innerHTML = openLoans.length
      ? openLoans.map((loan) => option(loan.id, `#${loan.id} · ${studentName(loan.studentId)} · ${bookTitle(loan.bookId)}`)).join("")
      : option("", "Nenhum empréstimo em aberto");
    if (openLoans.some((loan) => String(loan.id) === selectedReturn)) elements.returnLoan.value = selectedReturn;
    elements.returnLoan.disabled = openLoans.length === 0;

    const pendingBookIds = pending.filter((operation) => operation.type === "borrow").map((operation) => operation.bookId);
    [...elements.loanBook.options].forEach((item) => {
      if (pendingBookIds.includes(Number(item.value))) item.disabled = true;
    });
    const pendingReturns = pending.filter((operation) => operation.type === "return").map((operation) => operation.loanId);
    [...elements.returnLoan.options].forEach((item) => {
      if (pendingReturns.includes(Number(item.value))) item.disabled = true;
    });
  }

  function renderQueue() {
    elements.pendingCount.textContent = pending.length
      ? `${pending.length} ${pending.length === 1 ? "operação pendente" : "operações pendentes"}`
      : "Nenhuma alteração pendente";
    elements.pendingList.innerHTML = pending.length
      ? pending.map((operation, index) => {
        const label = operation.type === "borrow"
          ? `Novo empréstimo: ${studentName(operation.studentId)} · ${bookTitle(operation.bookId)}`
          : `Devolução: empréstimo #${operation.loanId} · ${bookTitle(operation.bookId)}`;
        return `<li><b>${String(index + 1).padStart(2, "0")} · ${operation.type === "borrow" ? "INSERT" : "UPDATE"}</b>${escapeHtml(label)}</li>`;
      }).join("")
      : `<li class="empty-state">Adicione uma operação para começar.</li>`;

    elements.transactionDot.classList.toggle("ready", pending.length > 0);
    elements.commit.disabled = pending.length === 0;
    elements.rollback.disabled = pending.length === 0;
    const closingStatement = lastOutcome === "committed"
      ? "COMMIT;"
      : lastOutcome === "rolled-back"
        ? "ROLLBACK;"
        : "-- Confirme com COMMIT ou desfaça com ROLLBACK.";
    elements.transactionCode.textContent = lastStatements.length
      ? "BEGIN;\n\n" + lastStatements.join("\n\n") + "\n\n" + closingStatement
      : "-- As operações SQL aparecerão aqui.";
    renderSelects();
  }

  function buildQuery() {
    const kind = elements.querySelect.value;
    const personId = Number(elements.queryStudent.value || 1);
    const person = data.students.find((student) => student.id === personId) ?? data.students[0];

    if (kind === "open") {
      const rows = data.loans.filter((loan) => loan.status === "Aberto").map((loan) => ({
        Empréstimo: loan.id, Estudante: studentName(loan.studentId), Livro: bookTitle(loan.bookId), Status: loan.status
      }));
      return {
        title: "Empréstimos em aberto",
        sql: "SELECT e.id_emprestimo, a.nome, l.titulo, e.status\nFROM emprestimo AS e\nJOIN estudante AS a ON a.id_estudante = e.id_estudante\nJOIN livro AS l ON l.id_livro = e.id_livro\nWHERE e.status = 'Aberto';",
        rows
      };
    }

    if (kind === "student") {
      const rows = data.loans.filter((loan) => loan.studentId === personId).map((loan) => ({
        Estudante: person.name, Livro: bookTitle(loan.bookId), "Data de retirada": loan.loanDate,
        Devolução: loan.returnDate || "—", Status: loan.status
      }));
      return {
        title: `Histórico · ${person.name}`,
        sql: `SELECT a.nome, l.titulo, e.data_emprestimo, e.data_devolucao, e.status\nFROM emprestimo AS e\nJOIN estudante AS a ON a.id_estudante = e.id_estudante\nJOIN livro AS l ON l.id_livro = e.id_livro\nWHERE a.id_estudante = ${personId};`,
        rows
      };
    }

    const totals = data.books.map((book) => ({
      Livro: book.title,
      Empréstimos: data.loans.filter((loan) => loan.bookId === book.id).length
    })).sort((a, b) => b.Empréstimos - a.Empréstimos || a.Livro.localeCompare(b.Livro));
    return {
      title: "Empréstimos por livro",
      sql: "SELECT l.titulo, COUNT(e.id_emprestimo) AS total_emprestimos\nFROM livro AS l\nLEFT JOIN emprestimo AS e ON e.id_livro = l.id_livro\nGROUP BY l.id_livro, l.titulo\nORDER BY total_emprestimos DESC;",
      rows: totals
    };
  }

  function renderQuery() {
    const query = buildQuery();
    elements.queryTitle.textContent = query.title;
    elements.queryCode.textContent = query.sql;
    elements.queryCount.textContent = `${query.rows.length} ${query.rows.length === 1 ? "linha" : "linhas"}`;
    if (!query.rows.length) {
      elements.queryResult.innerHTML = '<tbody><tr><td>Nenhum registro corresponde à consulta.</td></tr></tbody>';
      return;
    }
    const headings = Object.keys(query.rows[0]);
    elements.queryResult.innerHTML = `<thead><tr>${headings.map((heading) => `<th>${escapeHtml(heading)}</th>`).join("")}</tr></thead><tbody>${query.rows.map((row) => `<tr>${headings.map((heading) => `<td>${escapeHtml(row[heading])}</td>`).join("")}</tr>`).join("")}</tbody>`;
  }

  function render() {
    renderTable(selectedTable);
    renderSelects();
    renderQueue();
    renderQuery();
  }

  function stage(operation) {
    const trial = [...pending, operation];
    const preview = copy(data);
    const statements = [];
    try {
      trial.forEach((item) => statements.push(applyOperation(preview, item)));
    } catch (error) {
      setMessage(error.message, "error");
      return false;
    }
    pending = trial;
    lastStatements = statements;
    lastOutcome = "pending";
    renderQueue();
    setMessage("Operação adicionada. A base continua igual até o COMMIT.", "success");
    return true;
  }

  function commit() {
    const updated = copy(data);
    const statements = [];
    try {
      pending.forEach((operation) => statements.push(applyOperation(updated, operation)));
    } catch (error) {
      setMessage(`Transação cancelada: ${error.message}`, "error");
      return;
    }
    data = updated;
    pending = [];
    lastStatements = statements;
    lastOutcome = "committed";
    render();
    setMessage(`COMMIT concluído: ${statements.length} ${statements.length === 1 ? "operação aplicada" : "operações aplicadas"}.`, "success");
  }

  // Escolher uma consulta atualiza o exemplo SQL; executar reflete os dados correntes.
  document.querySelectorAll(".table-tab").forEach((button) => {
    button.addEventListener("click", () => renderTable(button.dataset.table));
  });

  elements.querySelect.addEventListener("change", () => {
    elements.studentFilter.classList.toggle("visible", elements.querySelect.value === "student");
    renderQuery();
  });
  elements.queryStudent.addEventListener("change", renderQuery);
  document.querySelector("#run-query").addEventListener("click", renderQuery);

  document.querySelector("#loan-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (elements.loanBook.disabled) return setMessage("Não há livros disponíveis para emprestar.", "error");
    stage({
      type: "borrow",
      studentId: Number(elements.loanStudent.value),
      bookId: Number(elements.loanBook.value)
    });
  });

  document.querySelector("#return-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (elements.returnLoan.disabled) return setMessage("Não há empréstimos em aberto.", "error");
    const loanId = Number(elements.returnLoan.value);
    const loan = data.loans.find((item) => item.id === loanId);
    if (!loan) return setMessage("O empréstimo escolhido não existe mais.", "error");
    stage({ type: "return", loanId, bookId: loan.bookId });
  });

  elements.commit.addEventListener("click", commit);
  elements.rollback.addEventListener("click", () => {
    pending = [];
    lastOutcome = "rolled-back";
    renderQueue();
    setMessage("ROLLBACK concluído. Nenhuma alteração pendente foi aplicada.", "success");
  });

  document.querySelector("#reset-demo").addEventListener("click", () => {
    data = copy(initialData);
    pending = [];
    lastStatements = [];
    lastOutcome = "pending";
    render();
    setMessage("Dados fictícios reiniciados.", "success");
  });

  // Define o estado inicial da interface e a primeira consulta demonstrativa.
  elements.studentFilter.classList.toggle("visible", elements.querySelect.value === "student");
  render();
})();