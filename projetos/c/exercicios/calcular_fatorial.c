#include <stdio.h>

int main() {
    int n, i;
    unsigned long long fatorial = 1;

    printf("Digite um número inteiro positivo: ");
    scanf("%d", &n);

    // Validação para números negativos
    if (n < 0) {
        printf("Erro: O fatorial de um número negativo não existe.\n");
    } else {
        // Cálculo do fatorial
        for (i = 1; i <= n; ++i) {
            fatorial *= i;
        }
        printf("Fatorial de %d = %llu\n", n, fatorial);
    }

    return 0;
}

