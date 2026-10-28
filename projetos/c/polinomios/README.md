# Operações com polinômios em C

Programa de terminal que representa polinômios por uma lista encadeada ordenada pelo expoente e permite somar, multiplicar e avaliar os dois polinômios.

## Compilar e executar

Com GCC instalado, abra o terminal nesta pasta e execute:

```sh
gcc -std=c11 -Wall -Wextra -pedantic polinomios.c -o polinomios
```

No Linux ou macOS:

```sh
./polinomios
```

No Windows com MinGW:

```powershell
.\polinomios.exe
```

## Usar o menu

1. Crie o Polinômio 1 e informe a quantidade de termos, depois cada coeficiente e expoente.
2. Repita para criar o Polinômio 2.
3. Use **Imprimir**, **Somar**, **Multiplicar** ou **Avaliar**.
4. Ao avaliar, informe o valor inteiro de `x`; o programa apresenta os valores de P1(x) e P2(x).
5. Escolha `0` para sair.

Os expoentes devem ser inteiros não negativos. Para representar um termo como `3x²`, informe coeficiente `3` e expoente `2`. A lista combina termos que tenham o mesmo expoente.

## Conceitos praticados

Lista encadeada, alocação dinâmica com `malloc` e `free`, funções, ordenação por expoente, soma e multiplicação de polinômios e avaliação recursiva.
