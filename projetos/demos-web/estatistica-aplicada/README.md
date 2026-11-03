# EstatLab — Estatística Aplicada

Laboratório didático para explorar estatística descritiva com um conjunto de dados editável. A amostra inicial é fictícia e representa tempos de atendimento em minutos.

## Recursos

- Entrada de valores inteiros ou decimais separados por vírgulas, ponto e vírgula ou quebras de linha.
- Média, mediana, moda e quantidade de observações.
- Mínimo, máximo, amplitude, variância e desvio padrão.
- Primeiro e terceiro quartis, calculados por interpolação linear.
- Alternância entre variância amostral (divisor n − 1) e populacional (divisor n).
- Histograma com quantidade de intervalos selecionável.
- Validação das entradas e limites de tamanho para manter a demonstração responsiva.

Para usar vírgula decimal, separe os valores com ponto e vírgula. Exemplo: `12,5; 14,1; 16,8`. Para separar por vírgula, use ponto decimal: `12.5, 14.1, 16.8`.

## Como executar

Abra `index.html` em um navegador. A demonstração usa HTML, CSS e JavaScript sem bibliotecas externas. Os dados são processados localmente e não são enviados nem salvos.

## Onde personalizar

- `app.js`: conjunto inicial (`SAMPLE_DATA`), leitura dos valores, fórmulas e histograma.
- `styles.css`: cores, cartões, gráficos e adaptação a telas menores.
- `index.html`: explicações, campos e organização do conteúdo.

Projeto acadêmico da disciplina de Estatística Aplicada.