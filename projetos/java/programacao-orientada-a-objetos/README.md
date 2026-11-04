# LabPOO — Programação Orientada a Objetos I

Aplicação didática em Java para cadastrar equipamentos de laboratório em uma janela Swing. A demonstração no navegador apresenta os mesmos conceitos com interações web; os arquivos Java são a implementação principal dos conceitos da disciplina.

## Conceitos praticados

- **Classes, atributos e métodos:** `Equipamento`, `Notebook`, `Projetor` e `Armario`.
- **Encapsulamento:** atributos privados e acesso por métodos; a coleção interna do armário não é exposta para edição direta.
- **Herança:** Notebook e Projetor estendem a classe abstrata Equipamento.
- **Polimorfismo:** cada subclasse implementa `detalhesTecnicos()`; a janela e o armário trabalham com a classe-base.
- **Interfaces:** `Ligavel` define as ações comuns.
- **Exceções:** dados inválidos e patrimônio duplicado geram `IllegalArgumentException`, tratada na janela.
- **Coleções:** `Armario` mantém os equipamentos em uma lista.
- **Programação em janela e por eventos:** a interface Swing responde a ações dos botões e da seleção.

## Executar a aplicação Java

É necessário ter JDK 11 ou superior instalado.

No terminal, dentro desta pasta, compile e execute:

```powershell
javac -d out src/main/java/br/com/iure/labpoo/*.java
java -cp out br.com.iure.labpoo.App
```

No macOS ou Linux, os mesmos comandos funcionam em um shell com suporte a expansão de `*.java`.

## Demonstração no navegador

Abra [LabPOO no GitHub Pages](https://iure-go.github.io/projetos/demos-web/programacao-orientada-a-objetos/). Os dados adicionados na demonstração são temporários e não são enviados a um servidor.

## Onde personalizar

- `Equipamento.java`: atributos e operações compartilhados.
- `Notebook.java` e `Projetor.java`: campos e comportamentos específicos de cada tipo.
- `Armario.java`: regras da coleção, como validação de patrimônio.
- `JanelaLaboratorio.java`: campos, disposição visual, botões e ações da interface.
- `App.java`: inicialização da aplicação Swing.

A estrutura acompanha os tópicos da ementa oficial de [Programação Orientada a Objetos I da UERJ](https://www.dep.uerj.br/ementa_dep_api.php?cdg_disciplina=14912).
