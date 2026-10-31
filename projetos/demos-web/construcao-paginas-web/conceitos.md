# Conceitos demonstrados no PageLab

## HTML semântico

O documento gerado usa `header`, `main` e `section` para indicar a função das partes da página. Também inclui idioma, codificação, viewport e título.

## CSS

O estilo gerado define uma variável CSS para a cor escolhida, usa uma grade para os cartões e uma media query para mudar a grade em telas menores.

## JavaScript e DOM

Eventos `input` e `change` leem os controles e atualizam a prévia e a área de código. A função de escape converte caracteres especiais do texto em entidades HTML antes da geração.

## Prévia isolada

O documento é apresentado por `iframe.srcdoc` com o atributo `sandbox` vazio. Assim, a página demonstrativa não recebe permissões para executar scripts, navegar a janela principal ou acessar recursos adicionais.

## Responsividade

Os controles Desktop e Celular alteram a largura da moldura de prévia. O documento gerado também reorganiza os cartões para uma coluna em telas estreitas.
