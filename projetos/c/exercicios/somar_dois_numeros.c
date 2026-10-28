#include <stdio.h>
#include <stdlib.h>
#include <locale.h>

int main(){
	
	setlocale(LC_ALL,"");
	
	int a, b, soma;
	
	printf("Digite um valor: ");
	scanf("%i", &a);
	
	printf("Digite um valor: ");
	scanf("%i", &b);
	
	soma = a+b;
	
	printf("\nSeus valores somados são: %d + %d = %d", a,b, soma);
	
	return 0;
}
