# Estudos e projetos em C

Esta pasta reúne uma seleção de exercícios e projetos acadêmicos em C.

## Projetos

- **Agenda telefônica:** versão mais recente enviada (`V2.0.c`), com lista duplamente encadeada, validação de dados, busca, navegação e leitura/gravação em TXT. Foi criada para Windows e inclui `<conio.h>` e `<windows.h>`, portanto não é portátil sem adaptações.
- **Operações com polinômios:** lista encadeada ordenada por expoente, soma, multiplicação e avaliação recursiva.

## Exercícios

Os exemplos menores praticam condicionais, entrada e saída, laços, fatorial e `sizeof`.

## Compilação

Com GCC instalado, a agenda pode ser compilada no Windows com MinGW:

```powershell
gcc agenda-telefonica/agenda_telefonica.c -o agenda.exe
```

O programa de polinômios usa C padrão e pode ser compilado com:

```sh
gcc polinomios/polinomios.c -o polinomios
```

Esses comandos indicam como compilar; os programas não foram executados nesta preparação.

## Privacidade e versões

A agenda salva os contatos em `contatos.txt` no computador onde for executada. Não use contatos reais em demonstrações e não envie esse arquivo ao GitHub. Cópias idênticas e rascunhos incompletos recebidos foram deixados fora desta seleção para evitar duplicação e código que não compila.
