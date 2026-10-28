#include <stdio.h>
#include <stdlib.h>

typedef struct Termo {
    int coeficiente;
    int expoente;
    struct Termo *prox;
} Termo;

// criar termo
Termo* criar_termo(int coef, int exp) {
    Termo* novo = (Termo*) malloc(sizeof(Termo));
    if (!novo) {
        printf("Erro de memoria\n");
        exit(1);
    }
    novo->coeficiente = coef;
    novo->expoente = exp;
    novo->prox = NULL;
    return novo;
}

// inserir ordenado
Termo* inserir_termo(Termo* pol, int coef, int exp) {
    if (coef == 0) return pol;

    Termo* novo = criar_termo(coef, exp);

    if (!pol || exp > pol->expoente) {
        novo->prox = pol;
        return novo;
    }

    Termo* atual = pol;
    Termo* anterior = NULL;

    while (atual && atual->expoente > exp) {
        anterior = atual;
        atual = atual->prox;
    }

    if (atual && atual->expoente == exp) {
        atual->coeficiente += coef;
        free(novo);
        return pol;
    }

    novo->prox = atual;
    if (anterior) anterior->prox = novo;

    return pol;
}

// impressÃ£o recursiva
void imprimir_recursivo(Termo* pol) {
    if (!pol) {
        printf("0");
        return;
    }

    if (pol->expoente == 0) {   // termo independente
        printf("%d", pol->coeficiente);
    }
    else if (pol->expoente == 1) {      // termo com expoente 1
        printf("%dx", pol->coeficiente);
    }
    else {    // demais termos
        printf("%dx^%d", pol->coeficiente, pol->expoente);
    }

    if (pol->prox) {
        if (pol->prox->coeficiente >= 0)
            printf(" + ");
        else
            printf(" ");
        imprimir_recursivo(pol->prox);
    }
}

// soma
Termo* soma(Termo* p1, Termo* p2) {
    printf("\n--- SOMA DE POLINOMIOS ---\n");
    printf("P1 = ");
    imprimir_recursivo(p1);
    printf("\nP2 = ");
    imprimir_recursivo(p2);
   
    Termo* res = NULL;

    while (p1) {
        res = inserir_termo(res, p1->coeficiente, p1->expoente);
        p1 = p1->prox;
    }
    while (p2) {
        res = inserir_termo(res, p2->coeficiente, p2->expoente);
        p2 = p2->prox;
    }
    
    printf("\n\nResultado da Soma = ");
    imprimir_recursivo(res);
    printf("\n");
    return res;
}

// multiplicaÃ§Ã£o
Termo* multiplicar(Termo* p1, Termo* p2) {
    printf("\n--- MULTIPLICACAO DE POLINOMIOS ---\n");
    printf("P1 = ");
    imprimir_recursivo(p1);
    printf("\nP2 = ");
    imprimir_recursivo(p2);

    Termo* res = NULL;

    for (Termo* a = p1; a != NULL; a = a->prox) {
        for (Termo* b = p2; b != NULL; b = b->prox) {
            res = inserir_termo(
                res,
                a->coeficiente * b->coeficiente,
                a->expoente + b->expoente
            );
        }
    }
    
    printf("\n\nResultado da Multiplicacao = ");
    imprimir_recursivo(res);
    printf("\n");
    return res;
}

// potÃªncia recursiva
int potencia(int base, int exp) {
    if (exp == 0) return 1;
    return base * potencia(base, exp - 1);}

// avaliaÃ§Ã£o recursiva
int avaliar(Termo* pol, int x) {
    if (!pol) return 0;
    return pol->coeficiente * potencia(x, pol->expoente)
           + avaliar(pol->prox, x);}

// liberar memÃ³ria recursivo
void liberar(Termo* pol) {
    if (!pol) return;
    liberar(pol->prox);
    free(pol);}

// leitura
Termo* ler_polinomio() {
    Termo* pol = NULL;
    int n, coef, exp;

    printf("Quantos termos? ");
    fflush(stdout);
    scanf("%d", &n);

    for (int i = 0; i < n; i++) {
        printf("Coeficiente: ");
        fflush(stdout);
        scanf("%d", &coef);

        printf("Expoente: ");
        fflush(stdout);
        scanf("%d", &exp);

        pol = inserir_termo(pol, coef, exp);
    }
    return pol;
}

// ================= MENU =================
int main() {
    Termo *p1 = NULL, *p2 = NULL, *res = NULL;
    int opcao, x;

    do {
        printf("\n===== MENU =====\n");
        printf("1 - Criar Polinomio 1\n");
        printf("2 - Criar Polinomio 2\n");
        printf("3 - Imprimir Polinomios\n");
        printf("4 - Somar\n");
        printf("5 - Multiplicar\n");
        printf("6 - Avaliar\n");
        printf("0 - Sair\n");
        printf("Opcao: ");
        scanf("%d", &opcao);

        switch (opcao) {
            case 1:
                liberar(p1);
                printf("\n--- Polinomio 1 ---\n");
                p1 = ler_polinomio();
                break;
            case 2:
                liberar(p2);
                printf("\n--- Polinomio 2 ---\n");
                p2 = ler_polinomio();
                break;
            case 3:
                printf("\nP1 = ");
                imprimir_recursivo(p1);
                printf("\nP2 = ");
                imprimir_recursivo(p2);
                printf("\n");
                break;
            case 4:
                liberar(res);
                res = soma(p1, p2);
                printf("\n");
                break;
            case 5:
                liberar(res);
                res = multiplicar(p1, p2);
                printf("\n");
                break;
            case 6:
                printf("Valor de x: ");
                scanf("%d", &x);
                printf("P1(%d) = %d\n", x, avaliar(p1, x));
                printf("P2(%d) = %d\n", x, avaliar(p2, x));
                break;
            case 0:
                printf("Saindo...\n");
                break;
            default:
                printf("Opcao invalida!\n");
        }
    } while (opcao != 0);

    liberar(p1);
    liberar(p2);
    liberar(res);

    return 0;
}

