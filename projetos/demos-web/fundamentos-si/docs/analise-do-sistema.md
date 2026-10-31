# Análise do sistema — LabFlux

## Contexto

Laboratórios universitários dependem de computadores, rede, projetores e outros equipamentos. Quando ocorre uma falha, a equipe precisa saber o que aconteceu, onde, com que urgência e quem está cuidando do atendimento.

## Objetivo

Organizar as solicitações de suporte em um único fluxo e disponibilizar informação útil para o acompanhamento diário e para decisões de melhoria.

## Atores

| Ator | Necessidade | Ações no sistema |
|---|---|---|
| Solicitante | Registrar um problema e acompanhar a solução | Abrir e consultar chamados |
| Técnico | Organizar e executar atendimentos | Consultar fila, assumir e atualizar chamados |
| Coordenação | Acompanhar a operação e identificar gargalos | Consultar indicadores e distribuição dos chamados |

## Processo proposto

1. O solicitante registra local, categoria, descrição e prioridade.
2. O sistema cria o chamado com status **Aberto** e data de registro.
3. A equipe consulta a fila e prioriza de acordo com urgência e impacto.
4. Um técnico assume o chamado e altera o status para **Em andamento**.
5. Após o atendimento, o técnico conclui o chamado.
6. A coordenação acompanha volume, status e categorias para identificar padrões.

## Entradas, processamento e saídas

- **Entradas:** dados do solicitante, local, categoria, descrição e prioridade.
- **Processamento:** validação, registro, classificação, atribuição e atualização de status.
- **Saídas:** fila de trabalho, estado de cada chamado e indicadores resumidos.

## Benefícios esperados

- Menos solicitações perdidas em conversas dispersas.
- Mais transparência sobre o andamento.
- Melhor priorização do trabalho.
- Dados históricos para apoiar decisões sobre manutenção e recursos.

## Premissas e limites

O protótipo não representa uma ferramenta oficial da UERJ. Os registros são demonstrativos e fictícios. Uma solução de produção precisaria de validação institucional, política de acesso, proteção de dados, persistência e operação monitorada.
