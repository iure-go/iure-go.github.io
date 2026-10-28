#include <stdio.h>

int main(){

    int numero;

    printf("Digite um numero: ");
    scanf("%d", &numero);

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
