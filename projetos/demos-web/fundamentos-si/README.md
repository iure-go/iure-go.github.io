# LabFlux — Sistema de chamados para laboratórios universitários

Projeto acadêmico para a disciplina **Fundamentos de Sistemas de Informação**. O LabFlux demonstra como pessoas, processos, dados e tecnologia podem se combinar para organizar solicitações de suporte em laboratórios universitários.

## Problema

Pedidos de manutenção e suporte podem chegar por canais diferentes, sem registro centralizado, prioridade definida ou visibilidade do andamento. Isso dificulta a organização da equipe e a identificação de problemas recorrentes.

## Proposta

O protótipo centraliza chamados com categoria, prioridade, laboratório, solicitante, responsável e status. Um painel resume o volume de solicitações e permite filtrar e atualizar os registros.

## Demonstração

Abra `index.html` em um navegador. O projeto usa HTML, CSS e JavaScript puros, sem instalação de dependências. Os dados são fictícios e ficam apenas na memória do navegador; recarregar a página restaura os exemplos.

## Escopo funcional

- Consultar indicadores e chamados recentes.
- Filtrar por status e pesquisar por texto.
- Abrir um chamado pelo formulário.
- Alterar o status entre aberto, em andamento e concluído.
- Consultar regras, requisitos e modelo conceitual descritos em `docs/`.

## Conceitos de Sistemas de Informação

- **Pessoas:** solicitantes, técnicos e coordenação.
- **Processos:** registrar, priorizar, atender, concluir e analisar chamados.
- **Dados:** solicitante, local, categoria, descrição, prioridade, responsável e datas.
- **Tecnologia:** interface web demonstrativa; numa implantação real, incluiria API, banco de dados, autenticação e controles de acesso.
- **Saídas de informação:** indicadores operacionais e lista priorizada para apoiar decisões.

## Estrutura

```text
fundamentos-sistemas-informacao/
├── index.html
├── styles.css
├── app.js
├── README.md
└── docs/
    ├── analise-do-sistema.md
    ├── requisitos.md
    └── modelo-de-dados.md
```

## Limitações e próximos passos

Este é um protótipo front-end, sem persistência, login, API ou notificações. Uma próxima versão poderia adicionar banco de dados, autenticação por perfil, histórico de alterações, anexos e relatórios exportáveis. Não use dados pessoais ou chamados reais neste protótipo.

## Tecnologias

HTML5 · CSS3 · JavaScript

## Autor

Iure Oliveira — estudante de Análise e Desenvolvimento de Sistemas.
