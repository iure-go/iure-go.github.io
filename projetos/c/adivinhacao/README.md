# Jogo de adivinhação em C

Projeto acadêmico da disciplina **Construção de Algoritmos**. O programa sorteia um número inteiro de 1 a 100 e recebe palpites até o jogador acertar.

## Como funciona

- Informa se o número secreto é maior ou menor que cada palpite.
- Valida a entrada para aceitar apenas inteiros entre 1 e 100.
- Conta e mostra o total de tentativas ao final.

## Compilar e executar

Com GCC instalado, nesta pasta execute:

```sh
gcc -std=c11 -Wall -Wextra -pedantic main.c -o adivinhacao
```

No Linux ou macOS, execute `./adivinhacao`. No Windows com MinGW, execute `.\adivinhacao.exe`.

## Conceitos praticados

Variáveis, condicionais, laços de repetição, entrada e saída, validação, geração de números pseudoaleatórios com `rand` e inicialização com `srand`.