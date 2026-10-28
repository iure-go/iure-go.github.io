# Simulador de caixa eletrônico em C

Projeto acadêmico da disciplina **Construção de Algoritmos**, desenvolvido como aplicação de terminal.

## O que o programa faz

- Exibe um menu para consultar saldo, depositar, sacar ou sair.
- Inicia com saldo de **R$ 0,00**.
- Aceita apenas valores positivos, com até duas casas decimais.
- Não permite sacar um valor maior que o saldo disponível.
- Mantém o saldo em centavos inteiros para evitar erros comuns de arredondamento com números decimais.

## Conceitos praticados

Variáveis, laços de repetição, condicionais, funções, ponteiros, validação de entrada e representação de valores em centavos.

## Compilar e executar

Com GCC instalado, na pasta deste projeto execute:

```sh
gcc -std=c11 -Wall -Wextra -pedantic main.c -o caixa-eletronico
```

No Linux ou macOS:

```sh
./caixa-eletronico
```

No Windows, o GCC normalmente gera `caixa-eletronico.exe`:

```powershell
.\caixa-eletronico.exe
```

Ao informar valores, use vírgula ou ponto como separador decimal (por exemplo, `25,50`). Não use separador de milhares.
