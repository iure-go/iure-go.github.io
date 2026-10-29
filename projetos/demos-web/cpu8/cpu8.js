"use strict";

const OPCODES = Object.freeze({
  LDI: 0x01, ADDI: 0x02, SUBI: 0x03, LOAD: 0x04, STORE: 0x05,
  JMP: 0x06, JZ: 0x07, OUT: 0x08, ANDI: 0x09, ORI: 0x0a, HLT: 0xff
});
// Tabela inversa: converte o byte do IR de volta no nome da instrução.
const NAMES = Object.fromEntries(Object.entries(OPCODES).map(([name, code]) => [code, name]));
const MEMORY_SIZE = 64, DATA_START = 48, PROGRAM_LIMIT = 48;
const SAMPLE = `; Soma 5 + 3, guarda o resultado em RAM[48]\n; e testa se o resultado é 8.\nLDI 5\nADDI 3\nSTORE 48\nLOAD 48\nSUBI 8\nJZ SUCESSO\nLDI 99\nOUT\nJMP FIM\nSUCESSO: LDI 1\nOUT\nFIM: HLT`;
const $ = (selector) => document.querySelector(selector);
const ui = {
  editor: $("#assembly"), assemble: $("#assemble"), run: $("#run"), reset: $("#reset"),
  next: $("#next-phase"), message: $("#message"), listing: $("#listing"), memory: $("#memory"),
  phaseName: $("#phase-name"), instruction: $("#current-instruction"), explanation: $("#cycle-explanation"),
  pc: $("#reg-pc"), ir: $("#reg-ir"), a: $("#reg-a"), operand: $("#reg-op"),
  zero: $("#flag-z"), carry: $("#flag-c"), count: $("#instruction-count"), output: $("#output")
};
let program = null, cpu = newCpu(), currentInstruction = "—", changedAddress = -1;

function newCpu() {
  // Uint8Array mantém cada posição da RAM dentro do intervalo de um byte (0–255).
  return { memory: new Uint8Array(MEMORY_SIZE), pc: 0, ir: null, operand: null, a: 0,
    zero: false, carry: false, phase: 0, decoded: null, currentPc: null,
    count: 0, halted: false, output: [], fault: "" };
}
function hex(value) { return value === null || value === undefined ? "—" : value.toString(16).toUpperCase().padStart(2, "0"); }

function assemble(source) {
  // Primeira passagem: encontra instruções e associa rótulos a endereços da RAM.
  const instructions = [], labels = new Map(), errors = [];
  source.split(/\r?\n/).forEach((sourceLine, index) => {
    let line = sourceLine.split(";")[0].trim();
    if (!line) return;
    const found = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (found) {
      const label = found[1].toUpperCase();
      if (labels.has(label)) errors.push(`Linha ${index + 1}: rótulo duplicado ${label}.`);
      else labels.set(label, instructions.length * 2);
      line = found[2].trim();
      if (!line) return;
    }
    const [rawMnemonic, rawOperand, extra] = line.split(/\s+/);
    const mnemonic = rawMnemonic.toUpperCase();
    if (!(mnemonic in OPCODES)) { errors.push(`Linha ${index + 1}: instrução desconhecida ${rawMnemonic}.`); return; }
    const takesOperand = !["OUT", "HLT"].includes(mnemonic);
    if ((takesOperand && (!rawOperand || extra)) || (!takesOperand && rawOperand)) {
      errors.push(`Linha ${index + 1}: confira o operando de ${mnemonic}.`); return;
    }
    instructions.push({ mnemonic, operandText: (rawOperand || "0").replace(/^#/, ""), line: index + 1 });
  });
  if (!instructions.length) errors.push("O programa não contém instruções.");
  if (instructions.length * 2 > PROGRAM_LIMIT) errors.push(`O programa pode ocupar no máximo ${PROGRAM_LIMIT} bytes.`);

  // Segunda passagem: resolve os operandos e codifica cada instrução em dois bytes.
  const bytes = [];
  instructions.forEach(({ mnemonic, operandText, line }) => {
    let operand = 0;
    if (!["OUT", "HLT"].includes(mnemonic)) {
      const token = operandText.toUpperCase();
      if (["JMP", "JZ"].includes(mnemonic) && labels.has(token)) operand = labels.get(token);
      else if (/^0X[0-9A-F]+$/i.test(operandText)) operand = Number.parseInt(operandText, 16);
      else if (/^\d+$/.test(operandText)) operand = Number(operandText);
      else { errors.push(`Linha ${line}: operando inválido ou rótulo não definido (${operandText}).`); return; }
      if (operand < 0 || operand > 255) { errors.push(`Linha ${line}: o operando deve estar entre 0 e 255.`); return; }
      if (["LOAD", "STORE"].includes(mnemonic) && operand >= MEMORY_SIZE) { errors.push(`Linha ${line}: endereço deve estar entre 0 e 63.`); return; }
      if (["JMP", "JZ"].includes(mnemonic) && (operand >= instructions.length * 2 || operand % 2)) { errors.push(`Linha ${line}: salto precisa apontar para um endereço par do programa.`); return; }
    }
    bytes.push(OPCODES[mnemonic], operand);
  });
  if (errors.length) throw new Error(errors.join(" "));
  return { instructions, bytes };
}

function setMessage(text, error = false) { ui.message.textContent = text; ui.message.classList.toggle("error", error); }
function resetMachine(nextProgram = program) {
  cpu = newCpu(); program = nextProgram; currentInstruction = "—"; changedAddress = -1;
  if (program) {
    // Carrega o código no começo da RAM; os dados ficam nos endereços 48–63.
    cpu.memory.set(program.bytes);
    ui.listing.textContent = program.instructions.map((item, i) =>
      `${hex(i * 2)}  ${hex(program.bytes[i * 2])} ${hex(program.bytes[i * 2 + 1])}   ${item.mnemonic}${["OUT", "HLT"].includes(item.mnemonic) ? "" : ` ${item.operandText}`}`
    ).join("\n");
  }
  render();
}
function fault(text) { cpu.fault = text; cpu.halted = true; setMessage(text, true); }
function updateA(value, carry = false) {
  // A máscara simula o limite de 8 bits; o excedente é indicado pela flag C.
  cpu.a = value & 255;
  cpu.zero = cpu.a === 0;
  cpu.carry = carry;
}

function advancePhase() {
  if (!program) { setMessage("Monte um programa antes de executar.", true); return; }
  if (cpu.halted) { setMessage(cpu.fault || "Programa finalizado. Reinicie para executá-lo novamente."); return; }
  if (cpu.phase === 0) {
    // BUSCAR: PC localiza o opcode; o operando está no byte seguinte.
    if (cpu.pc + 1 >= program.bytes.length || cpu.pc % 2) {
      fault(`PC ${hex(cpu.pc)} não aponta para uma instrução válida.`); render(); return;
    }
    cpu.currentPc = cpu.pc; cpu.ir = cpu.memory[cpu.pc]; cpu.operand = cpu.memory[cpu.pc + 1]; cpu.pc += 2; cpu.decoded = null;
    currentInstruction = `${NAMES[cpu.ir] || `OP ${hex(cpu.ir)}`} ${[OPCODES.OUT, OPCODES.HLT].includes(cpu.ir) ? "" : hex(cpu.operand)}`.trim();
    cpu.phase = 1;
    ui.explanation.textContent = `Busca: opcode ${hex(cpu.ir)} e operando ${hex(cpu.operand)} lidos no endereço ${hex(cpu.currentPc)}; PC avançou para ${hex(cpu.pc)}.`;
    setMessage(`Instrução localizada em ${hex(cpu.currentPc)}.`);
  } else if (cpu.phase === 1) {
    // DECODIFICAR: interpreta a operação guardada no registrador IR.
    cpu.decoded = NAMES[cpu.ir];
    if (!cpu.decoded) { fault(`Opcode ${hex(cpu.ir)} inválido.`); render(); return; }
    cpu.phase = 2;
    const isAddress = ["LOAD", "STORE", "JMP", "JZ"].includes(cpu.decoded);
    ui.explanation.textContent = `Decodificação: ${hex(cpu.ir)} corresponde a ${cpu.decoded}. ${["OUT", "HLT"].includes(cpu.decoded) ? "Sem operando." : `O valor ${hex(cpu.operand)} será tratado como ${isAddress ? "endereço" : "imediato"}.`}`;
    setMessage(`Opcode ${cpu.decoded} decodificado.`);
  } else {
    // EXECUTAR: aplica a instrução e atualiza registradores, flags ou memória.
    executeInstruction();
    if (!cpu.halted) cpu.phase = 0;
  }
  render();
}

function executeInstruction() {
  const { decoded: op, operand: n } = cpu;
  const old = cpu.a;
  let effect = "";
  switch (op) {
    case "LDI": updateA(n); effect = `A ← ${n} (${hex(n)}).`; break;
    case "ADDI": { const sum = cpu.a + n; updateA(sum, sum > 255); effect = `A ← A + ${n} = ${cpu.a}${cpu.carry ? "; carry ativo" : ""}.`; break; }
    case "SUBI": updateA(old - n, old < n); effect = `A ← A − ${n} = ${cpu.a}${cpu.carry ? "; borrow ativo" : ""}.`; break;
    case "LOAD": updateA(cpu.memory[n]); effect = `A ← RAM[${n}] = ${cpu.a}.`; break;
    case "STORE":
      // Impede que uma instrução sobrescreva a região reservada ao programa.
      if (n < DATA_START) { fault(`STORE só pode gravar na área de dados, endereços ${DATA_START}–63.`); return; }
      cpu.memory[n] = cpu.a; changedAddress = n; effect = `RAM[${n}] ← A = ${cpu.a}.`; break;
    case "JMP": cpu.pc = n; effect = `PC ← ${hex(n)}.`; break;
    case "JZ": if (cpu.zero) { cpu.pc = n; effect = `Z = 1; desvio para ${hex(n)}.`; } else effect = `Z = 0; sem desvio (PC ${hex(cpu.pc)}).`; break;
    case "OUT": cpu.output.push(cpu.a); effect = `saída ← A = ${cpu.a}.`; break;
    case "ANDI": updateA(cpu.a & n); effect = `A ← A AND ${n} = ${cpu.a}.`; break;
    case "ORI": updateA(cpu.a | n); effect = `A ← A OR ${n} = ${cpu.a}.`; break;
    case "HLT": cpu.halted = true; effect = "CPU parada pela instrução HLT."; break;
    default: fault(`Instrução ${op} não suportada.`); return;
  }
  cpu.count += 1; cpu.phase = 0; ui.explanation.textContent = `Execução: ${effect}`;
  setMessage(cpu.halted ? "Programa finalizado." : `Instrução ${cpu.count} executada.`);
}

function renderMemory() {
  // A grade apresenta os bytes em hexadecimal e separa visualmente código e dados.
  const cells = [];
  for (let address = 0; address < MEMORY_SIZE; address += 1) {
    const classes = ["memory-cell", address < DATA_START ? "code" : "data"];
    if (address === cpu.currentPc || address === cpu.currentPc + 1) classes.push("current");
    if (address === changedAddress) classes.push("changed");
    cells.push(`<div class="${classes.join(" ")}" role="listitem" aria-label="Endereço ${address}, valor ${cpu.memory[address]}"><span class="address">${hex(address)}</span><span class="value">${hex(cpu.memory[address])}</span></div>`);
  }
  ui.memory.innerHTML = cells.join("");
}
function render() {
  ui.phaseName.textContent = cpu.halted ? "Finalizado" : ["Buscar", "Decodificar", "Executar"][cpu.phase];
  ui.instruction.textContent = currentInstruction; ui.pc.textContent = hex(cpu.pc); ui.ir.textContent = hex(cpu.ir);
  ui.a.textContent = hex(cpu.a); ui.operand.textContent = hex(cpu.operand); ui.zero.textContent = Number(cpu.zero);
  ui.carry.textContent = Number(cpu.carry); ui.count.textContent = cpu.count;
  ui.output.textContent = cpu.output.length ? cpu.output.join(" → ") : "—";
  document.querySelectorAll(".phase").forEach((node) => {
    const index = Number(node.dataset.phase);
    node.classList.toggle("active", !cpu.halted && index === cpu.phase);
    node.classList.toggle("done", cpu.halted || index < cpu.phase);
  });
  ui.next.disabled = cpu.halted; ui.run.disabled = cpu.halted; renderMemory();
}
function compileEditor() {
  try {
    const candidate = assemble(ui.editor.value);
    resetMachine(candidate);
    ui.explanation.textContent = "CPU reiniciada. O PC aponta para o primeiro opcode no endereço 00.";
    setMessage(`Programa montado: ${candidate.instructions.length} instruções, ${candidate.bytes.length} bytes.`);
  } catch (error) { setMessage(error.message, true); }
}
function runProgram() {
  if (!program) { compileEditor(); if (!program) return; }
  let phases = 0;
  while (!cpu.halted && phases < 768) { advancePhase(); phases += 1; }
  if (!cpu.halted) setMessage("Execução pausada após 256 instruções para evitar loop infinito.", true);
  render();
}
ui.assemble.addEventListener("click", compileEditor);
ui.next.addEventListener("click", advancePhase);
ui.run.addEventListener("click", runProgram);
ui.reset.addEventListener("click", () => { resetMachine(); setMessage("CPU reiniciada; programa pronto para execução."); ui.explanation.textContent = "O PC aponta para o próximo opcode na memória."; });
ui.editor.value = SAMPLE;
compileEditor();

