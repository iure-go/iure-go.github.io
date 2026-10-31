# Modelo conceitual de dados — LabFlux

## Entidades

### Solicitante

- `idSolicitante` — identificador
- `nome` — nome de exibição
- `email` — contato institucional (em uma solução real)

### Técnico

- `idTecnico` — identificador
- `nome` — nome de exibição
- `especialidade` — área de atendimento

### Laboratório

- `idLaboratorio` — identificador
- `nome` — identificação do local
- `unidade` — prédio ou campus

### Chamado

- `idChamado` — identificador
- `titulo` e `descricao` — resumo do problema
- `categoria` — tipo de solicitação
- `prioridade` — baixa, média ou alta
- `status` — aberto, em andamento ou concluído
- `dataCriacao` e `dataAtualizacao` — datas de controle
- `idSolicitante` — referência ao solicitante
- `idTecnico` — referência opcional ao técnico responsável
- `idLaboratorio` — referência ao laboratório

## Relacionamentos

- Um solicitante pode registrar vários chamados; cada chamado tem um solicitante.
- Um técnico pode atender vários chamados; um chamado pode estar sem técnico atribuído enquanto aguarda triagem.
- Um laboratório pode ter vários chamados; cada chamado informa um laboratório.

## Esboço relacional

```text
SOLICITANTE (idSolicitante PK, nome, email)
TECNICO (idTecnico PK, nome, especialidade)
LABORATORIO (idLaboratorio PK, nome, unidade)
CHAMADO (idChamado PK, titulo, descricao, categoria, prioridade, status,
         dataCriacao, dataAtualizacao,
         idSolicitante FK, idTecnico FK NULL, idLaboratorio FK)
```

O protótipo guarda os exemplos em objetos JavaScript na memória. O modelo acima descreve uma possível persistência futura e não é implementado como banco de dados nesta versão.
