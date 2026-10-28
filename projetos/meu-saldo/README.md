# Meu Saldo

Aplicativo acadêmico desenvolvido para a disciplina **Programação para Dispositivos Móveis**, do curso de Análise e Desenvolvimento de Sistemas (UERJ/ZO).

O projeto reúne um aplicativo multiplataforma feito com Expo, React Native e TypeScript e uma API REST em Java com Spring Boot. A proposta é organizar receitas e despesas pessoais.

## Funcionalidades implementadas

- Resumo financeiro por dia, semana, mês e ano, com saldo, entradas, saídas e maiores gastos.
- Cadastro, edição, remoção, categorização e filtragem de lançamentos.
- Definição de limite mensal e relatório com totais por categoria.
- API REST para persistir lançamentos e orçamento mensal em banco H2.

## Tecnologias

React Native, Expo, TypeScript, Expo Router, Java 17, Spring Boot 3, Spring Data JPA e H2.

## Executar localmente

1. Instale Node.js, JDK 17 ou superior e Maven 3.9 ou superior.
2. Na pasta `backend`, inicie a API com `mvn spring-boot:run`. Por padrão, ela usa `http://localhost:8080`.
3. Na raiz do projeto, copie `.env.example` para `.env.local` e ajuste `EXPO_PUBLIC_API_URL` ao ambiente: `http://localhost:8080/api` no navegador/iOS Simulator; `http://10.0.2.2:8080/api` no emulador Android; ou o IP local do computador em um aparelho físico.
4. Instale as dependências com `npm install` e inicie o Expo com `npm start`.

A API usa o cabeçalho `X-Perfil-Id` para separar dados de demonstração. Esse mecanismo não é autenticação e o projeto é acadêmico; não use dados financeiros reais nem publique a API sem implementar autenticação e proteções apropriadas.

## Estrutura

- `app/`: telas e navegação do aplicativo.
- `services/`: integração HTTP com a API.
- `backend/`: API Spring Boot e persistência H2.
- `assets/`: ícones do aplicativo.

A pasta `android/` é gerada pelo Expo quando necessário. Arquivos locais de ambiente, dados do banco, caches e artefatos de compilação não fazem parte deste repositório.
