# malloc e calloc — demonstração web

Esta visualização didática compara um vetor reservado conceitualmente com `malloc` ou `calloc`. Escolha de 1 a 12 posições, grave valores e depois libere o vetor.

- **malloc:** as posições são marcadas como indeterminadas até que você grave um valor.
- **calloc:** as posições começam em zero.
- **free:** remove o vetor da visualização.

A página foi feita em JavaScript e não chama as funções de C nem representa endereços ou a memória física. Serve para explicar o conceito. O projeto em C de polinômios também usa `malloc` e `free`; consulte [o código](../../c/polinomios/).