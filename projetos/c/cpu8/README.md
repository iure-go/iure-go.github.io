# Simulador didático de CPU de 8 bits

Projeto acadêmico de **Organização de Computadores**. O programa em C simula uma CPU simplificada para demonstrar o ciclo de instrução: buscar, decodificar e executar.

## Conceitos demonstrados

- Registradores PC (contador de programa), IR (registrador de instrução), OP (operando) e A (acumulador).
- RAM de 64 bytes e instruções codificadas em pares de bytes: opcode e operando.
- Operações aritméticas e lógicas, acesso à memória, desvios condicionais e saída.
- Flags Z (zero) e C (carry na soma ou borrow na subtração).

O exemplo soma 5 e 3, grava o resultado no endereço 48, subtrai 8 e usa `JZ` para escolher o caminho que imprime `1`. A região de código ocupa os endereços 0–47; `STORE` grava somente na região de dados (48–63).

## Compilar e executar

Com GCC:

```sh
gcc -std=c11 -Wall -Wextra -pedantic cpu8.c -o cpu8
./cpu8
```

No Windows com MinGW:

```powershell
gcc -std=c11 -Wall -Wextra -pedantic cpu8.c -o cpu8.exe
.\cpu8.exe
```

## Demonstração no navegador

Abra a [versão interativa](../../demos-web/cpu8/README.md) para editar instruções e avançar o ciclo da CPU fase por fase.

## Limites do modelo

É um simulador introdutório, não uma implementação fiel a processador comercial. Não inclui interrupções, cache, pipeline ou modos avançados de endereçamento.

