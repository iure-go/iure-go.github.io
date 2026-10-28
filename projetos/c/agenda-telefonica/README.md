# Agenda telefônica em C

Aplicação de terminal para praticar `struct`, lista duplamente encadeada, validação de dados, navegação e leitura/gravação de arquivos TXT.

## Requisitos

O código usa `conio.h`, funções do Windows e comandos como `cls`. Compile e execute no Windows com MinGW/GCC. Não é portátil diretamente para Linux ou macOS.

## Compilar e executar

Abra o terminal nesta pasta e execute:

```powershell
gcc -std=c11 -Wall -Wextra agenda_telefonica.c -o agenda.exe
.\agenda.exe
```

Se o compilador reclamar sobre `conio.h`, confirme que está usando uma distribuição MinGW compatível com Windows.

## Usar o menu

- `1`: exibir todos os contatos.
- `2`: inserir contato.
- `3`: buscar contato pelo nome.
- `4`: exibir a lista e remover um contato.
- `5`: navegar pelos contatos.
- `6`: salvar os contatos em `contatos.txt`.
- `7`: carregar contatos de `contatos.txt`.
- `0`: sair.

A agenda começa vazia. Para preservar os dados entre execuções, use a opção **6** antes de sair e **7** ao iniciar novamente. O arquivo é criado no diretório de execução. Use apenas dados fictícios em demonstrações e não publique informações pessoais.
