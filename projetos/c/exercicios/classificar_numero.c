/*
 * GUIA DE EDIÇÃO
 * Exercício de condicionais para classificar inteiros em positivos, negativos ou zero.
 */
#include <stdio.h>

int main(){

    int numero;

    printf("Digite um numero: ");
    scanf("%d", &numero);

    // Os ramos cobrem os três casos possíveis: positivo, negativo e zero.
    if(numero > 0){
        printf("Numero positivo\n");
    }
    else if(numero < 0){
        printf("Numero negativo\n");
    }
    else{
        printf("Numero zero\n");
    }

    return 0;
}
