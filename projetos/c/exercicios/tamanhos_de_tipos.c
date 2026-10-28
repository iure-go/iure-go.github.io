#include <stdio.h>

int main() {
    int inteiro;
    float flutuante;
    double dobro;
    char caractere;

    printf("Tamanhos de memória no seu sistema:\n");
    printf("------------------------------------\n");
    
    // Usando sizeof com variáveis
    printf("int: %zu bytes\n", sizeof(inteiro));
    printf("float: %zu bytes\n", sizeof(flutuante));
    
    // Usando sizeof diretamente com o tipo
    printf("double: %zu bytes\n", sizeof(double));
    printf("char: %zu bytes\n", sizeof(char));
    printf("long long: %zu bytes\n", sizeof(long long));

    return 0;
}
