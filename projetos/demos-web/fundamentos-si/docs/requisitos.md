# Requisitos — LabFlux

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Exibir indicadores de chamados abertos, em andamento e concluídos | Alta |
| RF02 | Listar chamados com título, local, categoria, prioridade, status e data | Alta |
| RF03 | Pesquisar chamados por texto | Média |
| RF04 | Filtrar chamados por status | Média |
| RF05 | Registrar chamado com campos obrigatórios validados | Alta |
| RF06 | Atualizar status de um chamado | Alta |
| RF07 | Recalcular os indicadores após alterações | Alta |

## Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | Interface responsiva para telas grandes e pequenas |
| RNF02 | Navegação e textos em português claro |
| RNF03 | Contraste e foco visível nos controles principais |
| RNF04 | O protótipo deve funcionar sem bibliotecas externas |
| RNF05 | Não coletar nem enviar informações para serviços externos |

## Regras de negócio

- Todo chamado deve ter título, local, categoria, descrição e prioridade.
- Um chamado novo começa com status **Aberto**.
- Os status possíveis são **Aberto**, **Em andamento** e **Concluído**.
- Os dados de exemplo são fictícios e existem apenas durante a sessão.
- A prioridade orienta a ordenação visual; a decisão operacional cabe à equipe responsável.

## Critérios de aceite do protótipo

- O formulário impede envio quando faltam campos obrigatórios.
- Um chamado válido aparece na lista com status aberto.
- Pesquisa, filtro e atualização de status refletem-se na interface.
- Os indicadores correspondem ao conjunto atual de chamados.
