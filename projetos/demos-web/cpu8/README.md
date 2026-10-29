# CPU de 8 bits — demonstração web

Simulador didático de uma CPU simplificada, criado para a disciplina **Organização de Computadores**. A página permite montar um programa pequeno e acompanhar as fases de busca, decodificação e execução.

## Como abrir

Abra `index.html` em um navegador. A demonstração usa HTML, CSS e JavaScript sem dependências externas.

## Como experimentar

1. Clique em **Avançar uma fase** para observar, separadamente, busca, decodificação e execução.
2. Clique em **Executar** para rodar o programa inteiro.
3. Edite o programa e clique em **Montar programa** para carregar sua versão na memória.
4. Clique em **Reiniciar** para voltar ao início do programa montado.

O exemplo soma 5 e 3, armazena o valor no endereço 48, testa se o resultado é 8 e envia `1` à saída quando a condição é verdadeira.

## Modelo didático

- CPU de 8 bits, com acumulador A, contador de programa PC, registrador de instrução IR e operando OP.
- RAM de 64 bytes. As instruções ocupam dois bytes: opcode e operando.
- Endereços `00`–`2F` (0–47 em decimal) reservados ao programa; `30`–`3F` (48–63) reservados a dados.
- Flags Z (resultado zero) e C (carry na soma ou borrow na subtração).
- Instruções: `LDI`, `ADDI`, `SUBI`, `LOAD`, `STORE`, `JMP`, `JZ`, `ANDI`, `ORI`, `OUT` e `HLT`.
- Operandos numéricos aceitam decimal e hexadecimal (`0x10`). Comentários começam com `;` e rótulos podem ser usados em `JMP` e `JZ`.

Este modelo serve para estudo; não é uma implementação fiel a um processador comercial.

## Implementação em C

A versão de terminal está em [`../c/cpu8/cpu8.c`](../../c/cpu8/cpu8.c). Ela executa o mesmo exemplo e imprime uma trilha do ciclo da CPU.

