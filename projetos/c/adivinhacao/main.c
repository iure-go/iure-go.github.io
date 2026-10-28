#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <locale.h>

#define LIMITE_SUPERIOR 100
#define TAMANHO_ENTRADA 128

/* Lê um palpite inteiro e verifica se está entre 1 e 100. */
int ler_palpite(int *palpite)
{
    char entrada[TAMANHO_ENTRADA];
    char *fim;
    long valor;

    while (1) {
        printf("Seu palpite (1 a %d): ", LIMITE_SUPERIOR);

        if (fgets(entrada, sizeof entrada, stdin) == NULL) {
            return 0;
        }

        errno = 0;
        valor = strtol(entrada, &fim, 10);

        while (*fim == ' ' || *fim == '\t' || *fim == '\n' || *fim == '\r') {
            fim++;
        }

        if (entrada == fim || *fim != '\0' || errno == ERANGE ||
            valor < 1 || valor > LIMITE_SUPERIOR) {
            puts("Entrada inválida. Digite um número inteiro de 1 a 100.");
            continue;
        }

        *palpite = (int)valor;
        return 1;
    }
}

int main(void)
{
    setlocale(LC_ALL,"");
    
    int segredo;
    int palpite;
    int tentativas = 0;

    srand((unsigned int)time(NULL));
    segredo = rand() % LIMITE_SUPERIOR + 1;

    puts("=== Jogo de adivinhação ===");
    puts("Pensei em um número de 1 a 100. Tente descobrir!");

    do {
        if (!ler_palpite(&palpite)) {
            puts("Entrada encerrada. Até a próxima!");
            return 0;
        }

        tentativas++;

        if (palpite < segredo) {
            puts("O número secreto é maior.");
        } else if (palpite > segredo) {
            puts("O número secreto é menor.");
        }
    } while (palpite != segredo);

    printf("Acertou! Você precisou de %d tentativa(s).\n", tentativas);
    return 0;
}
