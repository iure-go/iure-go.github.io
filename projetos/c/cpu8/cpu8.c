#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

#define MEMORY_SIZE 64
#define DATA_START 48
#define MAX_STEPS 128

typedef enum {
    OP_LDI = 0x01, OP_ADDI = 0x02, OP_SUBI = 0x03, OP_LOAD = 0x04,
    OP_STORE = 0x05, OP_JMP = 0x06, OP_JZ = 0x07, OP_OUT = 0x08,
    OP_ANDI = 0x09, OP_ORI = 0x0A, OP_HLT = 0xFF
} Opcode;

/* Estado visível da CPU: memória, registradores, flags e condição de parada. */
typedef struct {
    uint8_t memory[MEMORY_SIZE];
    uint8_t pc, ir, operand, accumulator;
    bool zero, carry, halted;
    unsigned int instruction_count;
} Cpu;

/* Cada instrução ocupa dois bytes na RAM: opcode seguido do operando. */
typedef struct { uint8_t opcode, operand; } Instruction;

static const char *opcode_name(uint8_t opcode) {
    switch (opcode) {
        case OP_LDI: return "LDI";
        case OP_ADDI: return "ADDI";
        case OP_SUBI: return "SUBI";
        case OP_LOAD: return "LOAD";
        case OP_STORE: return "STORE";
        case OP_JMP: return "JMP";
        case OP_JZ: return "JZ";
        case OP_OUT: return "OUT";
        case OP_ANDI: return "ANDI";
        case OP_ORI: return "ORI";
        case OP_HLT: return "HLT";
        default: return "INVÁLIDA";
    }
}

static void update_accumulator(Cpu *cpu, int value, bool carry) {
    /* A máscara mantém o resultado em 8 bits; o excedente fica na flag C. */
    cpu->accumulator = (uint8_t)(value & 0xFF);
    cpu->zero = cpu->accumulator == 0;
    cpu->carry = carry;
}

static bool execute(Cpu *cpu) {
    const uint8_t previous = cpu->accumulator;
    switch (cpu->ir) {
        case OP_LDI:
            update_accumulator(cpu, cpu->operand, false);
            printf("  EXECUTAR: A <- %u\n", cpu->accumulator);
            break;
        case OP_ADDI: {
            const unsigned int sum = (unsigned int)cpu->accumulator + cpu->operand;
            update_accumulator(cpu, (int)sum, sum > 255U);
            printf("  EXECUTAR: A <- A + %u = %u%s\n", cpu->operand,
                   cpu->accumulator, cpu->carry ? " (carry)" : "");
            break;
        }
        case OP_SUBI:
            update_accumulator(cpu, (int)cpu->accumulator - cpu->operand,
                               previous < cpu->operand);
            printf("  EXECUTAR: A <- A - %u = %u%s\n", cpu->operand,
                   cpu->accumulator, cpu->carry ? " (borrow)" : "");
            break;
        case OP_LOAD:
            if (cpu->operand >= MEMORY_SIZE) {
                fprintf(stderr, "Erro: endereço de leitura fora da RAM.\n");
                return false;
            }
            update_accumulator(cpu, cpu->memory[cpu->operand], false);
            printf("  EXECUTAR: A <- RAM[%u] = %u\n", cpu->operand,
                   cpu->accumulator);
            break;
        case OP_STORE:
            if (cpu->operand < DATA_START || cpu->operand >= MEMORY_SIZE) {
                fprintf(stderr, "Erro: STORE deve usar endereço entre %u e %u.\n",
                        DATA_START, MEMORY_SIZE - 1);
                return false;
            }
            cpu->memory[cpu->operand] = cpu->accumulator;
            printf("  EXECUTAR: RAM[%u] <- A = %u\n", cpu->operand,
                   cpu->accumulator);
            break;
        case OP_JMP:
        case OP_JZ:
            if (cpu->operand % 2U != 0U || cpu->operand >= DATA_START) {
                fprintf(stderr, "Erro: destino de salto inválido.\n");
                return false;
            }
            if (cpu->ir == OP_JMP || cpu->zero) {
                cpu->pc = cpu->operand;
                printf("  EXECUTAR: PC <- %u%s\n", cpu->pc,
                       cpu->ir == OP_JZ ? " (Z=1)" : "");
            } else {
                puts("  EXECUTAR: Z=0, sem desvio");
            }
            break;
        case OP_OUT:
            printf("  EXECUTAR: saída <- %u\n", cpu->accumulator);
            break;
        case OP_ANDI:
            update_accumulator(cpu, cpu->accumulator & cpu->operand, false);
            printf("  EXECUTAR: A <- A AND %u = %u\n", cpu->operand,
                   cpu->accumulator);
            break;
        case OP_ORI:
            update_accumulator(cpu, cpu->accumulator | cpu->operand, false);
            printf("  EXECUTAR: A <- A OR %u = %u\n", cpu->operand,
                   cpu->accumulator);
            break;
        case OP_HLT:
            cpu->halted = true;
            puts("  EXECUTAR: CPU parada");
            break;
        default:
            fprintf(stderr, "Erro: opcode 0x%02X inválido.\n", cpu->ir);
            return false;
    }
    cpu->instruction_count++;
    printf("  ESTADO: PC=%02X A=%02X Z=%u C=%u\n\n", cpu->pc,
           cpu->accumulator, cpu->zero, cpu->carry);
    return true;
}

int main(void) {
    static const Instruction program[] = {
        { OP_LDI, 5 }, { OP_ADDI, 3 }, { OP_STORE, 48 }, { OP_LOAD, 48 },
        { OP_SUBI, 8 }, { OP_JZ, 18 }, { OP_LDI, 99 }, { OP_OUT, 0 },
        { OP_JMP, 22 }, { OP_LDI, 1 }, { OP_OUT, 0 }, { OP_HLT, 0 }
    };
    Cpu cpu = { 0 };
    const size_t instruction_total = sizeof(program) / sizeof(program[0]);
    const size_t program_bytes = instruction_total * 2U;

    if (program_bytes > DATA_START) {
        fputs("Erro: programa maior que a região de código.\n", stderr);
        return 1;
    }
    for (size_t i = 0; i < instruction_total; i++) {
        cpu.memory[i * 2U] = program[i].opcode;
        cpu.memory[i * 2U + 1U] = program[i].operand;
    }

    puts("Simulador didático de CPU de 8 bits");
    puts("Ciclo da instrução: buscar -> decodificar -> executar\n");
    while (!cpu.halted && cpu.instruction_count < MAX_STEPS) {
        const uint8_t address = cpu.pc;
        if ((size_t)address + 1U >= program_bytes || address % 2U != 0U) {
            fprintf(stderr, "Erro: PC aponta para instrução inexistente (0x%02X).\n",
                    address);
            return 1;
        }

        /* BUSCAR: PC localiza dois bytes, copiados para IR e OP. */
        cpu.ir = cpu.memory[address];
        cpu.operand = cpu.memory[address + 1U];
        cpu.pc = (uint8_t)(address + 2U);
        printf("PC=%02X  BUSCAR: IR=0x%02X OP=0x%02X\n", address,
               cpu.ir, cpu.operand);

        /* DECODIFICAR: traduzir o byte IR para uma operação conhecida. */
        printf("  DECODIFICAR: %s", opcode_name(cpu.ir));
        if (cpu.ir != OP_OUT && cpu.ir != OP_HLT) printf(" %u", cpu.operand);
        putchar('\n');

        /* EXECUTAR: alterar acumulador, memória, flags ou contador de programa. */
        if (!execute(&cpu)) return 1;
    }
    if (!cpu.halted) {
        fprintf(stderr, "Execução interrompida após %u instruções.\n", MAX_STEPS);
        return 1;
    }
    printf("Resultado armazenado em RAM[48]: %u\n", cpu.memory[48]);
    printf("Total de instruções executadas: %u de %zu\n",
           cpu.instruction_count, instruction_total);
    return 0;
}

