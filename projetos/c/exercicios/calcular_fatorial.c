/*
 * GUIA DE EDIÇÃO
 * Exercício de repetição e cálculo de fatorial. Edite o laço; para entradas maiores, reveja o tipo numérico para evitar overflow.
 */
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
        // Multiplica sucessivamente de 1 até n; para n igual a zero o resultado permanece 1.
        for (i = 1; i <= n; ++i) {
            fatorial *= i;
        }
        printf("Fatorial de %d = %llu\n", n, fatorial);
    }

    return 0;
}

