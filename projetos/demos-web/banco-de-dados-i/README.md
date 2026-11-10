# BancoLab · Banco de Dados I

Laboratório didático de SQL, integridade de dados e transações com um cenário fictício de empréstimos de biblioteca universitária.

## Objetivo

Praticar consultas relacionais e operações de dados, observando o papel das chaves e das restrições de integridade. A demonstração complementa o [DataLab de Modelagem de Dados](../modelagem-dados/), que apresenta o modelo relacional e a normalização.

## O que é possível explorar

- Alternar entre as tabelas de estudantes, livros e empréstimos e identificar PKs, FKs e atributos únicos.
- Executar exemplos de `SELECT`, `JOIN`, `WHERE` e `GROUP BY` sobre os registros exibidos.
- Preparar um novo empréstimo ou devolução e ver os comandos `INSERT` e `UPDATE` correspondentes.
- Confirmar o conjunto de mudanças com `COMMIT` ou descartá-lo com `ROLLBACK`.
- Observar validações de chave estrangeira, campos obrigatórios e disponibilidade de livros.

## Tecnologias

HTML, CSS e JavaScript sem dependências externas. Os dados fictícios são mantidos em memória no navegador e reiniciados ao recarregar a página. O executor implementa fluxos predefinidos de demonstração; não é um parser SQL completo nem um SGBD.

## Relação com o currículo

O fluxograma oficial do curso de Tecnologia em Análise e Desenvolvimento de Sistemas da UERJ posiciona Banco de Dados I no 3º período, depois de Modelagem de Dados. A ementa detalhada de Banco de Dados I não está disponível no ementário eletrônico consultado. Assim, este projeto foi elaborado como exercício introdutório de SQL, restrições de integridade e transações, sem atribuir esses tópicos à ementa oficial.

- [Fluxograma curricular de ADS · UERJ](https://www.dep.uerj.br/fluxos/tecnologia_em_analise_e_desenvolvimento_de_sistemas_fcee.pdf)
- [Ementário eletrônico da UERJ](https://www.dep.uerj.br/ementario.php)

## Abrir

[Abrir demonstração](https://iure-go.github.io/projetos/demos-web/banco-de-dados-i/) · [Ver arquivos no GitHub](https://github.com/iure-go/iure-go.github.io/tree/main/projetos/demos-web/banco-de-dados-i)
