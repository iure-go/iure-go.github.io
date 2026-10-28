#include <ctype.h>
#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

#define TAMANHO_ENTRADA 128

/* Converte uma entrada como "25,50" em centavos inteiros. */
int converter_para_centavos(const char *texto, long long *valor_centavos)
{
    const unsigned char *cursor = (const unsigned char *)texto;
    long long reais = 0;
    int centavos = 0;

    while (isspace(*cursor)) {
        cursor++;
    }

    if (*cursor == '+') {
        cursor++;
    }

    if (!isdigit(*cursor)) {
        return 0;
    }

    while (isdigit(*cursor)) {
        int digito = *cursor - '0';
        long long limite_reais = LLONG_MAX / 100;

        if (reais > (limite_reais - digito) / 10) {
            return 0;
        }

        reais = reais * 10 + digito;
        cursor++;
    }

    if (*cursor == ',' || *cursor == '.') {
        cursor++;

        if (!isdigit(*cursor)) {
            return 0;
        }

        centavos = (*cursor - '0') * 10;
        cursor++;

        if (isdigit(*cursor)) {
            centavos += *cursor - '0';
            cursor++;
        }

        /* O programa aceita no máximo duas casas decimais. */
        if (isdigit(*cursor)) {
            return 0;
        }
    }

    while (isspace(*cursor)) {
        cursor++;
    }

    if (*cursor != '\0' || reais > (LLONG_MAX - centavos) / 100) {
        return 0;
    }

    *valor_centavos = reais * 100 + centavos;
    return *valor_centavos > 0;
}

/* Lê e valida uma quantia positiva digitada pelo usuário. */
int ler_valor_positivo(long long *valor_centavos)
{
    char entrada[TAMANHO_ENTRADA];

    while (1) {
        printf("Digite o valor (ex.: 25,50): R$ ");

        if (fgets(entrada, sizeof entrada, stdin) == NULL) {
            return 0;
        }

        if (converter_para_centavos(entrada, valor_centavos)) {
            return 1;
        }

        puts("Valor inválido. Digite um número positivo com até duas casas decimais.");
    }
}

/* Lê uma opção inteira entre 1 e 4; retorna 0 quando a entrada é inválida. */
int ler_opcao(void)
{
    char entrada[TAMANHO_ENTRADA];
    char *fim;
    long opcao;

    if (fgets(entrada, sizeof entrada, stdin) == NULL) {
        return 4;
    }

    errno = 0;
    opcao = strtol(entrada, &fim, 10);

    if (entrada == fim || errno == ERANGE) {
        return 0;
    }

    while (isspace((unsigned char)*fim)) {
        fim++;
    }

    if (*fim != '\0' || opcao < 1 || opcao > 4) {
        return 0;
    }

    return (int)opcao;
}

void exibir_menu(void)
{
    puts("\n=== Simulador de caixa eletrônico ===");
    puts("1 - Consultar saldo");
    puts("2 - Depositar");
    puts("3 - Sacar");
    puts("4 - Sair");
    printf("Escolha uma opção: ");
}

void consultar_saldo(long long saldo_centavos)
{
    printf("Saldo atual: R$ %lld,%02lld\n",
           saldo_centavos / 100,
           saldo_centavos % 100);
}

/* Recebe o saldo por endereço para atualizar o valor original. */
int depositar(long long *saldo_centavos)
{
    long long valor;

    if (!ler_valor_positivo(&valor)) {
        return 0;
    }

    if (valor > LLONG_MAX - *saldo_centavos) {
        puts("Esse valor ultrapassa o limite suportado pelo programa.");
        return 1;
    }

    *saldo_centavos += valor;
    puts("Depósito realizado com sucesso.");
    consultar_saldo(*saldo_centavos);
    return 1;
}

/* O saque só altera o saldo quando há dinheiro suficiente. */
int sacar(long long *saldo_centavos)
{
    long long valor;

    if (!ler_valor_positivo(&valor)) {
        return 0;
    }

    if (valor > *saldo_centavos) {
        puts("Saldo insuficiente. O saque não foi realizado.");
        consultar_saldo(*saldo_centavos);
        return 1;
    }

    *saldo_centavos -= valor;
    puts("Saque realizado com sucesso.");
    consultar_saldo(*saldo_centavos);
    return 1;
}

int main(void)
{
    long long saldo_centavos = 0;
    int sair = 0;

    while (!sair) {
        int opcao;

        exibir_menu();
        opcao = ler_opcao();

        switch (opcao) {
            case 1:
                consultar_saldo(saldo_centavos);
                break;
            case 2:
                if (!depositar(&saldo_centavos)) {
                    sair = 1;
                }
                break;
            case 3:
                if (!sacar(&saldo_centavos)) {
                    sair = 1;
                }
                break;
            case 4:
                puts("Programa encerrado.");
                sair = 1;
                break;
            default:
                puts("Opção inválida. Escolha uma opção de 1 a 4.");
        }
    }

    return 0;
}
