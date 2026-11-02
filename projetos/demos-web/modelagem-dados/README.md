# DataLab · Modelagem de Dados

Projeto didático interativo para a disciplina de **Modelagem de Dados**, com um estudo de caso fictício de empréstimo de equipamentos em laboratórios universitários.

## O que demonstra

- Modelo relacional com entidades, atributos, PKs, FKs e cardinalidades.
- Navegação pelas entidades para entender seu papel no domínio.
- Esquema SQL de referência com restrições de integridade.
- Exercício guiado da tabela inicial até a 3ª Forma Normal.
- Dependências funcionais, chave composta e decomposição de relações.

## Executar

Abra `index.html` em um navegador moderno. O projeto não precisa de dependências, servidor ou banco de dados.

## Arquivos

- `index.html`: interface e diagrama lógico.
- `styles.css`: layout responsivo e estilo.
- `app.js`: navegação de entidades e simulador de normalização.
- `conceitos.md`: resumo da modelagem relacional e normalização.

O estudo de caso e os registros são didáticos. O esquema SQL é ilustrativo; nenhuma conexão ou persistência em banco está implementada.

## Editor SQL interativo

A seção Laboratório SQL executa consultas somente leitura sobre um pequeno conjunto de dados fictícios no navegador. O subconjunto didático aceita `SELECT`, `FROM`, `INNER JOIN`/`JOIN`, `WHERE` com condições unidas por `AND`, `ORDER BY` e `LIMIT`. Também oferece quatro exemplos para carregar e `Ctrl+Enter` para executar. Não implementa um banco SQL completo nem grava dados.
