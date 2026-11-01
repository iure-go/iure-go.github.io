# Conceitos de Matemática Discreta

## Conjuntos

Um conjunto é uma coleção bem definida de elementos. A união `A ∪ B` reúne os elementos de A ou B; a interseção `A ∩ B` mantém os elementos comuns; a diferença `A − B` contém os elementos de A que não estão em B. O exemplo interativo interpreta os valores como rótulos, remove duplicatas e ordena os elementos.

## Lógica proposicional

Uma proposição é uma afirmação que pode ser verdadeira (V) ou falsa (F). Conectivos como conjunção (`∧`), disjunção (`∨`), disjunção exclusiva (`⊕`), implicação (`→`) e bicondicional (`↔`) combinam proposições. A tabela-verdade avalia cada combinação possível.

| P | Q | P ∧ Q | P ∨ Q | P ⊕ Q | P → Q | P ↔ Q |
|---|---|---|---|---|---|---|
| V | V | V | V | F | V | V |
| V | F | F | V | V | F | F |
| F | V | F | V | V | V | F |
| F | F | F | F | F | V | V |

## Relações binárias

Uma relação binária em A é qualquer subconjunto de `A × A`, o conjunto de todos os pares ordenados possíveis. O simulador testa:

- **Reflexividade:** cada elemento está relacionado consigo mesmo.
- **Simetria:** se `(a,b)` pertence à relação, `(b,a)` também pertence.
- **Antissimetria:** se `(a,b)` e `(b,a)` pertencem, então `a = b`.
- **Transitividade:** se `(a,b)` e `(b,c)` pertencem, então `(a,c)` também pertence.

## Relação com computação

Conjuntos e operações aparecem em consultas e filtros; lógica formaliza condições de algoritmos e circuitos; relações modelam grafos, dependências, permissões e associações entre entidades em bancos de dados.
