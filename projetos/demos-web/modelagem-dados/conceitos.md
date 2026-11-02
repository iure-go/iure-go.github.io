# Modelagem de Dados — conceitos do projeto

## Estudo de caso

O sistema controla empréstimos de equipamentos de laboratório por alunos. Um empréstimo pode incluir diversos equipamentos, e um equipamento pode aparecer em diferentes empréstimos ao longo do tempo. A relação N:N é resolvida pela entidade associativa `ITEM_EMPRESTIMO`, que também registra as condições de retirada e devolução.

## Modelo relacional

- **ALUNO** (`id_aluno` PK): pessoa que solicita empréstimos.
- **EMPRESTIMO** (`id_emprestimo` PK, `id_aluno` FK): operação de retirada.
- **EQUIPAMENTO** (`id_equipamento` PK, `id_categoria` FK): item inventariado.
- **CATEGORIA** (`id_categoria` PK): classificação de equipamentos.
- **ITEM_EMPRESTIMO** (`id_emprestimo` PK/FK, `id_equipamento` PK/FK): resolve a associação N:N.

## Formas normais

### 1FN

Cada atributo contém um valor atômico, sem listas ou grupos repetidos na mesma célula. Cada registro pode ser identificado por uma chave.

### 2FN

Uma relação está em 2FN quando está em 1FN e cada atributo não chave depende da chave candidata inteira. Se a chave for composta, um atributo não pode depender apenas de uma parte dela.

### 3FN

Uma relação está em 3FN quando está em 2FN e atributos não chave não dependem transitivamente da chave. Uma informação que depende de outra entidade deve ser armazenada na relação correspondente.

No exemplo de matrícula, `cod_disciplina → id_professor → nome_professor`. Por isso, o nome do professor é separado em `PROFESSOR`, evitando repetir esse dado a cada disciplina ou matrícula.

## Chaves e integridade

A chave primária (PK) identifica unicamente uma linha. Uma chave estrangeira (FK) referencia uma chave de outra relação. A PK composta de `MATRICULA` (`id_aluno`, `cod_disciplina`) garante uma matrícula por aluno e disciplina; suas FKs mantêm a integridade com `ALUNO` e `DISCIPLINA`.
