// ========== BIBLIOTECAS ==========
// Explicação: São "caixas de ferramentas" já prontas com funções que ajudam a fazer várias tarefas.
// É como pedir ajuda para especialistas que já sabem lidar com telas, textos e teclados.

#include <stdio.h>      // Ferramentas para mostrar mensagens na tela (printf) e ler o que o usuário digita (scanf)
#include <stdlib.h>     // Ferramentas para gerenciar memória (malloc, free) e interagir com o sistema (system)
#include <string.h>     // Ferramentas para trabalhar com textos: copiar, procurar, medir comprimento
#include <ctype.h>      // Ferramentas para verificar caracteres: se é número, letra, maiúscula/minúscula
#include <conio.h>      // Ferramenta especial que lê cada tecla pressionada no momento exato (_getch) sem esperar Enter
#include <locale.h>     // Ferramenta para configurar idioma (acentos em português)

// ========== CONSTANTES SIMBÓLICAS ==========
// Explicação: Em vez de digitar números "mágicos" (como 101) no código, damos nomes.
// Facilita a manutenção: se precisar mudar o tamanho, muda em um só lugar.

#define MAX_FIELD 101   // Tamanho máximo para qualquer campo (nome, telefone, etc.) = 100 caracteres + 1 para final

// ========== CORES E ESTILOS ==========
// Explicação: São "códigos mágicos" que fazem o terminal colorir os textos.
// Cada \x1b[... começa uma sequência de controle que o terminal interpreta.
// Exemplo: \x1b[31m = "use vermelho para o texto daqui em diante"

#define RESET        "\x1b[0m"        // Código que desliga todas as cores/estilos (volta ao normal)
#define NEGRITO      "\x1b[1m"        // Ativa negrito
#define PRETO        "\x1b[30m"       // Cor da letra: preto
#define VERMELHO     "\x1b[31m"       // Cor da letra: vermelho
#define VERDE        "\x1b[32m"       // Cor da letra: verde
#define AMARELO      "\x1b[33m"       // Cor da letra: amarelo
#define AZUL         "\x1b[38;5;33m"  // Cor da letra: azul (tom específico)
#define BG_VERMELHO  "\x1b[41m"       // Cor de fundo: vermelho (background)
#define BG_VERDE     "\x1b[42m"       // Cor de fundo: verde
#define BG_AMARELO   "\x1b[43m"       // Cor de fundo: amarelo

// ========== ESTRUTURA PRINCIPAL (STRUCT) ==========
// Explicação: É como um "formulário" que junta várias informações sobre uma mesma coisa.
// Aqui criamos o molde "Contato" com espaços para nome, telefone, nascimento, email,
// E dois "ganchos" (ponteiros) para conectar este contato ao anterior e ao próximo da lista.

typedef struct Contato {
    char nome[MAX_FIELD];              // Espaço para o nome (máximo 100 caracteres)
    char telefone[MAX_FIELD];          // Espaço para o telefone
    char nascimento[MAX_FIELD];        // Espaço para data de nascimento
    char email[MAX_FIELD];             // Espaço para email

    struct Contato *proximo;           // "Gancho" que aponta para o próximo contato na lista
    struct Contato *anterior;          // "Gancho" que aponta para o contato anterior na lista
} Contato;

// ========== VARIÁVEIS GLOBAIS ==========
// Explicação: São variáveis que podem ser acessadas de qualquer parte do programa.
// Funcionam como "post-its" compartilhados que guardam informações da lista inteira.

Contato *cabeca = NULL;    // Aponta para o primeiro contato da lista (NULL = nenhum no momento)
Contato *cauda  = NULL;    // Aponta para o último contato da lista
Contato *atual  = NULL;    // Aponta para o contato que está sendo visualizado na navegação

// ========== FUNÇÃO PARA LIMPAR O BUFFER DO TECLADO ==========
// Explicação: Quando o usuário digita algo e aperta Enter, o programa lê o que interessa,
// mas a tecla Enter fica "suja" no buffer (memória temporária do teclado). 
// Esta função "engole" esse lixo para não atrapalhar a próxima leitura.

void limparBuffer(void) {
    int c;   // Variável temporária para guardar cada caractere "sujo"
    
    // Enquanto o caractere lido NÃO for Enter ('\n') e não for o final do arquivo (EOF)...
    while ((c = getchar()) != '\n' && c != EOF) {
        // ...simplesmente descarta (não faz nada com o caractere)
    }
}

// ========== FUNÇÃO PARA LIMPAR STRING ==========
// Explicação: Remove caracteres "sujos" do final de um texto (como Enter e retorno de carro)
// que podem ter ficado quando o usuário digitou algo.

void limparString(char *texto) {
    size_t len = strlen(texto);   // Mede o comprimento do texto
    
    // Enquanto o texto tiver caracteres E o último caractere for '\n' (Enter) ou '\r' (retorno de carro)...
    while (len > 0 && (texto[len - 1] == '\n' || texto[len - 1] == '\r')) {
        texto[--len] = '\0';   // Substitui esse caractere sujo pelo terminador '\0' (que marca "fim do texto")
    }
}

// ========== VALIDAÇÃO DE EMAIL ==========
// Explicação: Verifica se um email parece correto. As regras são:
// - Deve ter um @ (arroba)
// - Deve ter um ponto DEPOIS do @
// - Não pode ter espaços
// - Não pode começar com @ ou .
// - Não pode terminar com .
// - Só pode ter um @
// - O @ não pode ser o último caractere
// - Depois do @ não pode vir ponto imediatamente

int emailValido(const char *str) {
    int temArroba      = 0;     // Contador de arrobas
    int temPontoDepois = 0;     // Bandeira: achou ponto depois do @?
    int tamanho        = strlen(str);   // Mede o tamanho do email

    // Se o email estiver vazio, não é válido
    if (tamanho == 0) return 0;

    // Se o primeiro caractere for @ ou ., não é válido
    if (str[0] == '@' || str[0] == '.')
        return 0;

    // Se o último caractere for ., não é válido
    if (str[tamanho - 1] == '.')
        return 0;

    // Percorre cada caractere do email, um por um
    for (int i = 0; i < tamanho; i++) {

        // Se tiver espaço em qualquer lugar, não é válido
        if (str[i] == ' ')
            return 0;

        // Se encontrar @...
        if (str[i] == '@') {
            temArroba++;   // Conta mais um @

            // Se tiver mais de um @, não é válido
            if (temArroba > 1)
                return 0;

            // Se o @ for o último caractere, não é válido
            if (i == tamanho - 1)
                return 0;

            // Se depois do @ vier um ponto imediatamente, não é válido
            if (str[i + 1] == '.')
                return 0;
        }

        // Se encontrar um ponto E já tiver passado por um @ (temArroba == 1)...
        if (str[i] == '.' && temArroba == 1) {
            temPontoDepois = 1;   // Marca que achou ponto depois do @
        }
    }

    // Se não achou @ ou não achou ponto depois dele, não é válido
    if (temArroba == 0 || temPontoDepois == 0)
        return 0;

    // Passou em todos os testes: email é válido!
    return 1;
}

// ========== FUNÇÃO PARA LER STRING COM VALIDAÇÃO OPCIONAL ==========
// Explicação: Mostra uma mensagem, lê o que o usuário digita, remove o Enter do final,
// e (se pedido) fica repetindo até que um email válido seja fornecido.

void lerString(const char *rotulo, char *str, int tamanho, int validarEmail) {
    do {
        // Mostra o rótulo (ex: "Email: ") e lê a resposta do usuário
        printf("%s", rotulo);
        fgets(str, tamanho, stdin);          // fgets = "file get string": lê uma linha inteira
        
        str[strcspn(str, "\n")] = 0;         // Remove o Enter ('\n') do final substituindo por '\0'

        // Se a validação de email estiver ativada E o email for inválido...
        if (validarEmail && !emailValido(str)) {
            printf("Email inválido! Deve conter '@' e '.'\n");   // Avisa o usuário
        }
        // Repete enquanto for para validar E o email continuar inválido
    } while (validarEmail && !emailValido(str));
}

// ========== FORMATAÇÃO DE TELEFONE ==========
// Explicação: Pega os números digitados (só dígitos), conta quantos são (10 ou 11),
// e formata no padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.

int formatarTelefone(const char *origem, char *destino, int tamanho) {
    char digitos[12];     // Array para guardar até 11 dígitos + terminador
    int count = 0;        // Quantos dígitos foram encontrados

    // Se os ponteiros forem inválidos ou o tamanho for zero/negativo, sai
    if (origem == NULL || destino == NULL || tamanho <= 0) {
        return 0;
    }

    // Percorre a string de origem até o fim ou até coletar 11 dígitos
    for (int i = 0; origem[i] != '\0' && count < 11; i++) {
        // isdigit = "é dígito?" (0-9)
        if (isdigit((unsigned char)origem[i])) {
            digitos[count++] = origem[i];   // Guarda o dígito e avança o contador
        }
    }

    digitos[count] = '\0';   // Marca o fim da string de dígitos

    // Se tiver 10 dígitos, formata como (XX) XXXX-XXXX
    if (count == 10) {
        snprintf(destino, tamanho,
                 "(%.2s) %.4s-%.4s",   // %.2s = imprime os 2 primeiros dígitos
                 digitos,              // Começando do início
                 digitos + 2,          // Pula 2 dígitos para o prefixo
                 digitos + 6);         // Pula 6 dígitos para o sufixo
        return 1;   // Sucesso
    }

    // Se tiver 11 dígitos, formata como (XX) XXXXX-XXXX
    if (count == 11) {
        snprintf(destino, tamanho,
                 "(%.2s) %.5s-%.4s",
                 digitos,
                 digitos + 2,
                 digitos + 7);          // Pula 7 dígitos (DD + 5 do número)
        return 1;   // Sucesso
    }

    return 0;   // Não tinha 10 nem 11 dígitos = falha
}

// ========== COMPARAÇÃO IGNORANDO MAIÚSCULAS/MINÚSCULAS ==========
// Explicação: Compara duas strings (A vs B) tratando maiúsculas e minúsculas como iguais.
// É uma versão case-insensitive da strcmp.

int compareInsensitive(const char *a, const char *b) {
    // Enquanto ambos tiverem caracteres...
    while (*a && *b) {
        // Converte cada caractere para minúsculo antes de comparar
        char ca = (char)tolower((unsigned char)*a);
        char cb = (char)tolower((unsigned char)*b);

        // Se forem diferentes...
        if (ca != cb) {
            return ca - cb;   // Retorna a diferença (negativo se a<b, positivo se a>b)
        }

        a++;   // Avança para o próximo caractere de A
        b++;   // Avança para o próximo caractere de B
    }

    // Se chegou aqui, uma das strings acabou. Retorna a diferença dos caracteres finais.
    return tolower((unsigned char)*a) - tolower((unsigned char)*b);
}

// ========== CONVERSÃO PARA MINÚSCULAS (CRIANDO CÓPIA) ==========
// Explicação: Cria uma NOVA string igual à original, mas com todas as letras minúsculas.
// Importante: faz malloc (alocação de memória), então quem chamar precisa dar free depois!

char *strtolower(const char *orig) {
    // Reserva memória: comprimento + 1 (para o terminador '\0')
    char *cop = malloc(strlen(orig) + 1);

    // Se a alocação falhar (memória insuficiente)...
    if (cop == NULL) {
        return NULL;
    }

    // Copia cada caractere convertendo para minúsculo
    for (size_t i = 0; orig[i] != '\0'; i++) {
        cop[i] = (char)tolower((unsigned char)orig[i]);
    }

    // Marca o fim da nova string
    cop[strlen(orig)] = '\0';
    return cop;
}

// ========== VALIDAÇÃO DE NOME ==========
// Explicação: Verifica se o nome contém apenas letras, espaços, hífens e apóstrofos.
// O primeiro caractere não pode ser espaço, hífen ou apóstrofo.

int nomeValido(const char *nome) {
    // Nome vazio não é válido
    if (strlen(nome) == 0) {
        return 0;
    }

    // Primeiro caractere não pode ser espaço, hífen ou apóstrofo
    if (nome[0] == ' ' || nome[0] == '-' || nome[0] == '\'') {
        return 0;
    }

    // Percorre todos os caracteres do nome
    for (int i = 0; nome[i] != '\0'; i++) {
        // Se NÃO for letra E NÃO for espaço E NÃO for hífen E NÃO for apóstrofo...
        // (o '!' significa "não")
        if (!isalpha((unsigned char)nome[i]) &&
            nome[i] != ' ' &&
            nome[i] != '-' &&
            nome[i] != '\'') {
            return 0;   // Caractere inválido encontrado
        }
    }

    return 1;   // Passou em todos os testes
}

// ========== LEITURA DE NOME EM TEMPO REAL ==========
// Explicação: Em vez de esperar o Enter, captura cada tecla pressionada.
// Mostra na tela imediatamente. Bloqueia caracteres inválidos.
// Backspace funciona para apagar. Números são ignorados.

void lerNome(char *destino, int tamanho) {
    int pos = 0;     // Posição atual no array destino
    int c;           // Código da tecla pressionada

    printf("Nome: ");

    // _getch() lê uma tecla sem esperar Enter. '\r' é o Enter (carriage return)
    while ((c = _getch()) != '\r') {

        // Se for backspace (tecla para apagar)...
        if (c == '\b') {
            if (pos > 0) {           // Se tiver algo para apagar...
                pos--;               // Volta uma posição
                printf("\b \b");     // Truque visual: volta, escreve espaço, volta de novo (apaga na tela)
            }
        }
        // Se for letra OU espaço OU hífen OU apóstrofo...
        else if (isalpha(c) || c == ' ' || c == '-' || c == '\'') {

            // Bloqueia primeiro caractere inválido (espaço, hífen, apóstrofo no início)
            if (pos == 0 && (c == ' ' || c == '-' || c == '\'')) {
                continue;   // Ignora e volta ao início do loop
            }

            // Se ainda couber no array...
            if (pos < tamanho - 1) {
                destino[pos++] = c;   // Guarda o caractere e avança a posição
                putchar(c);           // Mostra o caractere na tela
            }
        }
        // Qualquer outra tecla (como números) é simplesmente ignorada (não faz nada)
    }

    destino[pos] = '\0';   // Marca o fim do nome
    printf("\n");

    // Validação final de segurança (reforço)
    if (!nomeValido(destino)) {
        printf(BG_AMARELO PRETO "Nome inválido.\n" RESET);
        lerNome(destino, tamanho);   // Chama a si mesma para tentar de novo (recursão)
    }
}

// ========== LEITURA DE TELEFONE COM MÁSCARA EM TEMPO REAL ==========
// Explicação: Mostra a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX enquanto o usuário digita.
// A máscara se adapta automaticamente conforme 10 ou 11 dígitos são inseridos.

void lerTelefone(char *out) {
    char digitos[12];   // Array para guardar até 11 dígitos + terminador
    int pos;            // Posição atual
    int c;              // Código da tecla

    do {
        pos = 0;
        printf("Telefone: ");

        while ((c = _getch()) != '\r') {   // Enquanto não for Enter...

            if (c == '\b') {   // Backspace (apagar)
                if (pos > 0) {
                    pos--;

                    // ---- Redesenha toda a linha do zero ----
                    printf("\rTelefone: ");             // Volta ao início da linha e reescreve "Telefone: "
                    for (int i = 0; i < 30; i++) printf(" ");  // Apaga tudo até o final (espaços)
                    printf("\rTelefone: ");             // Volta de novo e reescreve "Telefone: "

                    // Redesenha com a máscara apropriada
                    for (int i = 0; i < pos; i++) {
                        if (i == 0) printf("(");            // Parêntese no primeiro dígito
                        if (i == 2) printf(") ");           // Fecha parêntese e espaço após DDD
                        if (i == 7 && pos > 10) printf("-"); // Hífen para 11 dígitos
                        if (i == 6 && pos <= 10) printf("-"); // Hífen para 10 dígitos
                        printf("%c", digitos[i]);           // Mostra o dígito
                    }
                }
            }
            else if (isdigit(c)) {   // Se for um dígito (0-9)...

                if (pos < 11) {      // Máximo de 11 dígitos
                    digitos[pos++] = c;   // Guarda e avança

                    // ---- Redesenha tudo com a máscara ----
                    printf("\rTelefone: ");
                    for (int i = 0; i < 30; i++) printf(" ");
                    printf("\rTelefone: ");

                    for (int i = 0; i < pos; i++) {
                        if (i == 0) printf("(");
                        if (i == 2) printf(") ");
                        // Se já temos mais de 10 dígitos E estamos na posição 7, usa hífen ali
                        // Se temos 10 ou menos dígitos, hífen na posição 6
                        if (i == 7 && pos > 10) printf("-");
                        if (i == 6 && pos <= 10) printf("-");
                        printf("%c", digitos[i]);
                    }
                }
            }
            // Letras e outros caracteres são ignorados
        }

        digitos[pos] = '\0';   // Finaliza a string de dígitos
        printf("\n");

        // Se tiver menos de 10 dígitos, avisa e repete
        if (pos < 10) {
            printf(BG_AMARELO PRETO "Telefone deve ter pelo menos 10 dígitos.\n" RESET);
        }

    } while (pos < 10);   // Repete enquanto não tiver pelo menos 10 dígitos

    // Formata final (garantia extra)
    formatarTelefone(digitos, out, MAX_FIELD);
}

// ========== VALIDAÇÃO DE DATA ==========
// Explicação: Verifica se uma data é real (considera meses com 30/31 dias e anos bissextos).

int dataValida(int dia, int mes, int ano) {
    // Ano deve ser >= 1900, mês entre 1 e 12, dia pelo menos 1
    if (ano < 1900 || mes < 1 || mes > 12 || dia < 1)
        return 0;

    int diasMes;   // Quantos dias o mês tem

    switch (mes) {
        case 2:   // Fevereiro: caso especial (bissexto)
            // Ano bissexto: divisível por 4 E (não divisível por 100 OU divisível por 400)
            if ((ano % 4 == 0 && ano % 100 != 0) || (ano % 400 == 0))
                diasMes = 29;   // Bissexto: 29 dias
            else
                diasMes = 28;   // Normal: 28 dias
            break;

        case 4: case 6: case 9: case 11:   // Meses com 30 dias
            diasMes = 30;
            break;

        default:   // Todos os outros: 31 dias
            diasMes = 31;
    }

    return dia <= diasMes;   // O dia informado é válido para esse mês?
}

// ========== LEITURA DE DATA COM MÁSCARA EM TEMPO REAL ==========
// Explicação: Mostra DD/MM/AAAA enquanto o usuário digita os 8 dígitos.
// Valida se a data é real no final.

void lerData(char *out) {
    char digitos[9];   // 8 dígitos + terminador
    int pos;
    int c;
    int dia, mes, ano;

    do {
        pos = 0;
        printf("Data (DD/MM/AAAA): ");

        while ((c = _getch()) != '\r') {

            if (c == '\b') {   // Backspace
                if (pos > 0) {
                    pos--;
                    // Redesenha com máscara
                    printf("\rData (DD/MM/AAAA): ");
                    for (int i = 0; i < 20; i++) printf(" ");
                    printf("\rData (DD/MM/AAAA): ");

                    for (int i = 0; i < pos; i++) {
                        if (i == 2 || i == 4) printf("/");   // Barras nas posições 2 e 4
                        printf("%c", digitos[i]);
                    }
                }
            }
            else if (isdigit(c)) {
                if (pos < 8) {   // Exatamente 8 dígitos (DDMMAAAA)
                    digitos[pos++] = c;
                    // Redesenha com máscara
                    printf("\rData (DD/MM/AAAA): ");
                    for (int i = 0; i < 20; i++) printf(" ");
                    printf("\rData (DD/MM/AAAA): ");

                    for (int i = 0; i < pos; i++) {
                        if (i == 2 || i == 4) printf("/");
                        printf("%c", digitos[i]);
                    }
                }
            }
        }

        digitos[pos] = '\0';
        printf("\n");

        // Se não digitou os 8 números, avisa
        if (pos != 8) {
            printf(BG_AMARELO PRETO "Data incompleta.\n" RESET);
            continue;   // Volta ao início do do-while
        }

        // Extrai dia, mês e ano dos dígitos (sscanf = "string scanf": lê de uma string)
        sscanf(digitos, "%2d%2d%4d", &dia, &mes, &ano);

        // Se a data não for válida, avisa e força repetir
        if (!dataValida(dia, mes, ano)) {
            printf(BG_AMARELO PRETO "Data inválida.\n" RESET);
            pos = 0;   // Força o loop a continuar
        }

    } while (pos != 8);   // Só sai quando tiver 8 dígitos válidos

    // Formata a data no padrão DD/MM/AAAA
    sprintf(out, "%02d/%02d/%04d", dia, mes, ano);
}

// ========== CRIAÇÃO DE UM NOVO CONTATO NA MEMÓRIA ==========
// Explicação: Reserva um espaço na memória do computador (malloc) para guardar um contato.
// Depois copia os dados (nome, telefone, etc.) para esse espaço e retorna o endereço.

Contato *criarContato(const char *nome, const char *telefone, 
                      const char *nascimento, const char *email) {
    // malloc = "memory allocate": pede ao sistema um bloco de memória do tamanho de um Contato
    Contato *novo = malloc(sizeof(Contato));

    // Se o sistema não conseguiu reservar memória (raro, mas possível)...
    if (novo == NULL) {
        printf(BG_VERMELHO "Erro: falha ao alocar memória.\n" RESET);
        exit(EXIT_FAILURE);   // Encerra o programa com erro
    }

    // Copia os dados para o novo contato (strncpy = "string copy with limit": cópia segura)
    strncpy(novo->nome, nome, MAX_FIELD - 1);
    novo->nome[MAX_FIELD - 1] = '\0';   // Garante que a string termina corretamente

    strncpy(novo->telefone, telefone, MAX_FIELD - 1);
    novo->telefone[MAX_FIELD - 1] = '\0';

    strncpy(novo->nascimento, nascimento, MAX_FIELD - 1);
    novo->nascimento[MAX_FIELD - 1] = '\0';

    strncpy(novo->email, email, MAX_FIELD - 1);
    novo->email[MAX_FIELD - 1] = '\0';

    // Inicializa os "ganchos" como NULL (ainda não está conectado a ninguém)
    novo->proximo = NULL;
    novo->anterior = NULL;

    return novo;   // Devolve o endereço do novo contato criado
}

// ========== INSERIR CONTATO NA LISTA ==========
// Explicação: Lê todas as informações do novo contato, cria ele na memória,
// e o encaixa no final da lista (ou como primeiro, se a lista estiver vazia).

void inserirContato(void) {
    char nome[MAX_FIELD];
    char telefone[MAX_FIELD];
    char nascimento[MAX_FIELD];
    char email[MAX_FIELD];

    // Lê cada campo usando as funções de leitura em tempo real
    lerNome(nome, MAX_FIELD);
    lerTelefone(telefone);
    lerData(nascimento);
    lerString("Email: ", email, MAX_FIELD, 0);

    // Valida o email em loop até ser válido
    while (!emailValido(email)) {
        printf("Email inválido!\n");
        lerString("Email: ", email, MAX_FIELD, 0);
    }

    // Cria o novo contato na memória
    Contato *novo = criarContato(nome, telefone, nascimento, email);

    // Se a lista estiver vazia (primeiro contato)...
    if (cabeca == NULL) {
        cabeca = novo;    // Primeiro contato
        cauda  = novo;    // Também é o último
        atual  = novo;    // Já começa visualizando ele
    } 
    // Se já existir alguém na lista...
    else {
        cauda->proximo = novo;    // O último contato agora aponta para o novo
        novo->anterior = cauda;   // O novo contato aponta de volta para o último
        cauda = novo;             // O novo passa a ser o último da lista
    }
    system("cls");   // Limpa a tela (Windows: "cls")
    printf(BG_VERDE "Contato inserido com sucesso.\n" RESET);
}

// ========== EXIBIR UM CONTATO ==========
// Explicação: Mostra na tela as informações de um contato específico.
// Pode mostrar com número (posição) ou sem.

void exibirContato(const Contato *contato, int posicao) {
    // Se posição for positiva, mostra o número do contato
    if (posicao > 0) {
        printf("[%d] Nome: %s\n", posicao, contato->nome);
    } else {
        printf("Nome: %s\n", contato->nome);
    }

    printf("    Telefone: %s\n", contato->telefone);
    printf("    Nascimento: %s\n", contato->nascimento);
    printf("    Email: %s\n", contato->email);
    printf("\n");
}

// ========== EXIBIR LISTA COMPLETA ==========
// Explicação: Mostra todos os contatos em uma tabela organizada,
// ordenados por nome (usando Bubble Sort - um método simples de ordenação).

void exibirLista(void) {
    // Se a lista estiver vazia...
    if (cabeca == NULL) {
        printf(BG_VERMELHO PRETO "\nA lista está vazia.\n" RESET);
        return;
    }

    // ---- PASSO 1: contar quantos contatos existem ----
    int count = 0;
    Contato *ptr = cabeca;
    while (ptr != NULL) {
        count++;
        ptr = ptr->proximo;
    }

    // ---- PASSO 2: criar um vetor temporário de ponteiros ----
    // Aloca espaço para 'count' ponteiros
    Contato **contatos = malloc(count * sizeof(Contato *));
    if (contatos == NULL) {
        printf("Erro: falha ao alocar memória.\n");
        return;
    }

    // Copia os ponteiros da lista para o vetor
    ptr = cabeca;
    for (int i = 0; i < count; i++) {
        contatos[i] = ptr;
        ptr = ptr->proximo;
    }

    // ---- PASSO 3: ordenar o vetor por nome (Bubble Sort) ----
    // Bubble Sort: compara pares adjacentes e troca se estiverem fora de ordem
    for (int i = 0; i < count - 1; i++) {
        for (int j = 0; j < count - 1 - i; j++) {
            // Se o nome do contato j for "maior" que o do j+1 (ordem alfabética)...
            if (compareInsensitive(contatos[j]->nome, contatos[j + 1]->nome) > 0) {
                // Troca os ponteiros de lugar
                Contato *temp = contatos[j];
                contatos[j] = contatos[j + 1];
                contatos[j + 1] = temp;
            }
        }
    }

    // ---- PASSO 4: exibir como tabela ----
    printf(NEGRITO VERDE "\n=== Planilha de Contatos ===\n" RESET);
    // Linha superior da tabela
    printf("+----+----------------------+-----------------+------------+------------------------------+\n");
    // Cabeçalho
    printf("| " NEGRITO AZUL "ID" RESET" | "NEGRITO AZUL "Nome                "RESET" | "NEGRITO AZUL "Telefone       "RESET" | " NEGRITO AZUL "Nascimento"RESET" | " NEGRITO AZUL "Email                        "RESET"|\n");
    printf("+----+----------------------+-----------------+------------+------------------------------+\n");

    // Imprime cada contato, truncando campos longos (%-20.20s = no máximo 20 caracteres)
    for (int i = 0; i < count; i++) {
        printf("| %-2d | %-20.20s | %-15.15s | %-10.10s | %-28.28s |\n",
               i + 1,
               contatos[i]->nome,
               contatos[i]->telefone,
               contatos[i]->nascimento,
               contatos[i]->email);
    }

    // Linha inferior da tabela
    printf("+----+----------------------+-----------------+------------+------------------------------+\n");

    free(contatos);   // Libera o vetor temporário
}

// ========== BUSCAR CONTATO POR PARTE DO NOME ==========
// Explicação: Pergunta um termo, converte tudo para minúsculo (para busca case-insensitive),
// e procura em todos os contatos usando strstr (que acha uma string dentro de outra).

void buscarContato(void) {
    if (cabeca == NULL) {
        printf(BG_VERMELHO PRETO "\nA lista está vazia.\n" RESET);
        return;
    }

    char termo[MAX_FIELD];
    lerString("Digite o nome ou parte do nome para buscar: ", termo, MAX_FIELD, 0);

    if (strlen(termo) == 0) {
        printf("Termo de busca vazio.\n");
        return;
    }

    // Converte o termo de busca para minúsculo
    char *termoMinusculo = strtolower(termo);
    if (termoMinusculo == NULL) {
        printf("Erro de memória.\n");
        return;
    }

    Contato *ptr = cabeca;
    int encontrados = 0;
    int idx = 1;

    // Percorre toda a lista
    while (ptr != NULL) {
        // Converte o nome do contato para minúsculo
        char *nomeMinusculo = strtolower(ptr->nome);

        // strstr = "string search": procura a substring dentro da string
        // Se achou E a conversão funcionou...
        if (nomeMinusculo != NULL && strstr(nomeMinusculo, termoMinusculo) != NULL) {
            // Se for o primeiro encontrado, mostra cabeçalho
            if (encontrados == 0) {
                printf("Contatos encontrados:\n");
            }
            exibirContato(ptr, idx);
            encontrados++;
        }

        free(nomeMinusculo);   // Libera a cópia em minúsculo do nome
        ptr = ptr->proximo;    // Próximo contato
        idx++;
    }

    free(termoMinusculo);   // Libera a cópia em minúsculo do termo

    if (encontrados == 0) {
        printf("Nenhum contato encontrado para '%s'.\n", termo);
    }
}

// ========== REMOVER CONTATO ==========
// Explicação: Procura por parte do nome, remove o primeiro contato encontrado,
// reajustando os ponteiros da lista para "pular" o contato removido.
// Depois libera a memória ocupada por ele (free).

void removerContato(void) {
    if (cabeca == NULL) {
        printf(BG_VERMELHO PRETO "\nA lista está vazia.\n" RESET);
        return;
    }

    char nomeBusca[MAX_FIELD];
    lerString("\nDigite o nome do contato a remover: ", nomeBusca, MAX_FIELD, 0);

    if (strlen(nomeBusca) == 0) {
        system("cls");
        printf("Nome vazio.\n");
        return;
    }

    char *nomeBuscaMinusculo = strtolower(nomeBusca);
    if (nomeBuscaMinusculo == NULL) {
        system("cls");
        printf("Erro de memória.\n");
        return;
    }

    Contato *ptr = cabeca;

    // Percorre a lista procurando o contato
    while (ptr != NULL) {
        char *nomeMinusculo = strtolower(ptr->nome);

        if (nomeMinusculo != NULL && strstr(nomeMinusculo, nomeBuscaMinusculo) != NULL) {
            // ---- REAJUSTE DOS PONTEIROS ----
            
            // Se não for o primeiro da lista...
            if (ptr->anterior != NULL) {
                ptr->anterior->proximo = ptr->proximo;   // O anterior "pula" este contato
            } else {
                cabeca = ptr->proximo;   // Se for o primeiro, cabeça aponta para o próximo
            }

            // Se não for o último da lista...
            if (ptr->proximo != NULL) {
                ptr->proximo->anterior = ptr->anterior;   // O próximo "pula" este
            } else {
                cauda = ptr->anterior;   // Se for o último, cauda aponta para o anterior
            }

            // Se o contato removido era o que estava sendo visualizado...
            if (atual == ptr) {
                if (ptr->proximo != NULL) {
                    atual = ptr->proximo;   // Vai para o próximo
                } else {
                    atual = ptr->anterior;  // Ou para o anterior
                }
            }

            free(nomeMinusculo);
            free(nomeBuscaMinusculo);
            free(ptr);   // Libera a memória do contato removido
            system("cls");
            printf("Contato removido com sucesso.\n");
            return;   // Sai da função
        }

        free(nomeMinusculo);
        ptr = ptr->proximo;
    }

    system("cls");
    free(nomeBuscaMinusculo);
    printf("Nenhum contato encontrado com esse nome.\n");
}

// ========== NAVEGAR PELA LISTA ==========
// Explicação: Permite ao usuário "caminhar" pelos contatos um a um,
// vendo o atual, indo para o próximo, voltando ao anterior.
// Usa a variável global 'atual' para saber qual está sendo visto.

void navegarLista(void) {
    if (cabeca == NULL) {
        printf(BG_VERMELHO PRETO "\nA lista está vazia.\n" RESET);
        return;
    }

    int opcao;

    do {
        printf(VERDE "=== Navegação ===\n");
        printf("1. Exibir contato atual\n");
        printf("2. Próximo contato\n");
        printf("3. Contato anterior\n");
        printf("0. Voltar ao menu principal\n" RESET);
        printf("Escolha: ");

        // scanf("%d", &opcao) tenta ler um número. Se falhar (usuário digitou letra), retorna 0 ou EOF
        if (scanf("%d", &opcao) != 1) {
            limparBuffer();
            opcao = -1;   // Força opção inválida
        } else {
            limparBuffer();
        }

        switch (opcao) {
            case 1:
                system("cls");
                if (atual != NULL) {
                    exibirContato(atual, 0);   // Mostra sem número de posição
                } else {
                    printf("Nenhum contato selecionado.\n");
                }
                break;

            case 2:
                system("cls");
                if (atual != NULL && atual->proximo != NULL) {
                    atual = atual->proximo;   // Avança para o próximo
                    exibirContato(atual, 0);
                } else {
                    printf("Já está no último contato.\n\n");
                }
                break;

            case 3:
                system("cls");
                if (atual != NULL && atual->anterior != NULL) {
                    atual = atual->anterior;   // Volta para o anterior
                    exibirContato(atual, 0);
                } else {
                    printf("Já está no primeiro contato.\n\n");
                }
                break;

            case 0:
                system("cls");
                break;

            default:
                system("cls");
                printf("Opção inválida. Tente novamente.\n\n");
                break;
        }
    } while (opcao != 0);   // Repete até o usuário escolher 0 (voltar)
}

// ========== FUNÇÕES AUXILIARES PARA MANIPULAÇÃO DE ARQUIVOS ==========

// Mostra instruções de onde o usuário pode encontrar o arquivo gerado
void mostrarInstrucaoArquivo(const char *nomeArquivo) {
    printf(BG_VERDE "Arquivo gerado: %s\n" RESET, nomeArquivo);
    printf(BG_AMARELO PRETO "Se estiver usando compilador online, baixe o arquivo pelo painel de arquivos do site.\n" RESET);
    printf(BG_AMARELO PRETO "Se estiver no computador, procure o arquivo na mesma pasta do programa.\n" RESET);
}

// Tenta abrir o arquivo automaticamente (só funciona no Windows)
void tentarAbrirArquivo(const char *nomeArquivo) {
    char resposta[MAX_FIELD];
    char comando[MAX_FIELD + 30];

    lerString("Deseja tentar abrir o arquivo agora? (s/n): ", resposta, MAX_FIELD, 0);

    // Se a resposta não começar com 's' ou 'S'...
    if (tolower((unsigned char)resposta[0]) != 's') {
        mostrarInstrucaoArquivo(nomeArquivo);
        return;
    }

    // Verifica se é Windows (_WIN32 é definido em compiladores Windows)
#if defined(_WIN32)
    // Monta o comando: start "" "nome_do_arquivo" (abre com o programa padrão)
    snprintf(comando, sizeof(comando), "start \"\" \"%s\"", nomeArquivo);

    // system() executa um comando no terminal do sistema operacional
    if (system(comando) != 0) {
        mostrarInstrucaoArquivo(nomeArquivo);   // Se falhar, mostra instruções
    }
#else
    // Em sistemas não-Windows, não tenta abrir automaticamente
    printf(BG_AMARELO PRETO "Este ambiente não permite abrir ou baixar automaticamente pelo programa.\n" RESET);
    mostrarInstrucaoArquivo(nomeArquivo);
#endif
}

// ========== SALVAR LISTA EM ARQUIVO TXT ==========
// Explicação: Cria (ou sobrescreve) um arquivo "contatos.txt" com todos os contatos,
// no mesmo formato usado na tela, um abaixo do outro.

void salvarEmTxt(void) {
    if (cabeca == NULL) {
        printf(BG_VERMELHO PRETO "\nA lista está vazia.\n" RESET);
        return;
    }

    // fopen("nome", "w") = abre arquivo para escrita ("w" = write)
    // Se o arquivo não existe, cria. Se existe, apaga e começa do zero.
    FILE *arquivo = fopen("contatos.txt", "w");

    if (arquivo == NULL) {
        printf(BG_VERMELHO "Erro ao criar o arquivo contatos.txt.\n" RESET);
        return;
    }

    // Escreve cabeçalho no arquivo
    fprintf(arquivo, "=== Lista Telefônica ===\n\n");

    Contato *ptr = cabeca;
    int posicao = 1;

    // Percorre toda a lista, escrevendo cada contato no arquivo
    while (ptr != NULL) {
        // fprintf = "file printf": igual ao printf, mas escreve no arquivo
        fprintf(arquivo, "[%d] Nome: %s\n", posicao, ptr->nome);
        fprintf(arquivo, "    Telefone: %s\n", ptr->telefone);
        fprintf(arquivo, "    Nascimento: %s\n", ptr->nascimento);
        fprintf(arquivo, "    Email: %s\n", ptr->email);

        ptr = ptr->proximo;
        posicao++;
    }

    fclose(arquivo);   // Fecha o arquivo (importante para salvar corretamente!)
    printf(BG_VERDE "Arquivo contatos.txt salvo com sucesso na pasta do programa.\n" RESET);
    tentarAbrirArquivo("contatos.txt");   // Pergunta se quer abrir
}

// ========== CARREGAR LISTA DE ARQUIVO TXT ==========
// Explicação: Lê o arquivo "contatos.txt", procura linhas que contenham "Nome:",
// extrai os dados de cada contato e recria a lista na memória.
// A lista anterior é perdida (as variáveis globais são redefinidas).

void carregarDeArquivo() {
    // Reseta a lista (descarta a lista atual)
    cabeca = NULL;
    cauda  = NULL;

    // Abre o arquivo para leitura ("r" = read)
    FILE *file = fopen("contatos.txt", "r");

    if (file == NULL) {
        printf("Erro ao abrir o arquivo!\n");
        return;
    }

    char linha[200];         // Buffer para ler cada linha
    Contato *novo;

    // fgets(linha, tamanho, file): lê uma linha do arquivo
    // Retorna NULL quando chegar ao final
    while (fgets(linha, sizeof(linha), file)) {

        // Se a linha contiver "Nome:"...
        if (strstr(linha, "Nome:")) {

            // Cria um novo contato na memória
            novo = malloc(sizeof(Contato));

            // sscanf: igual ao scanf, mas lê de uma string em vez do teclado
            // %[^\n] = "leia tudo até encontrar Enter" (ou seja, o resto da linha)
            sscanf(linha, " [%*d] Nome: %[^\n]", novo->nome);

            // Lê as próximas 3 linhas (telefone, nascimento, email)
            fgets(linha, sizeof(linha), file);
            sscanf(linha, " Telefone: %[^\n]", novo->telefone);

            fgets(linha, sizeof(linha), file);
            sscanf(linha, " Nascimento: %[^\n]", novo->nascimento);

            fgets(linha, sizeof(linha), file);
            sscanf(linha, " Email: %[^\n]", novo->email);

            // Inicializa os ponteiros
            novo->proximo = NULL;
            novo->anterior = NULL;

            // Encaixa na lista (mesma lógica do inserirContato)
            if (cabeca == NULL) {
                cabeca = novo;
                cauda  = novo;
            } else {
                cauda->proximo = novo;
                novo->anterior = cauda;
                cauda = novo;
            }
        }
    }

    fclose(file);   // Fecha o arquivo
    printf("Contatos carregados com sucesso!\n");
}

// ========== LIBERAR TODA A MEMÓRIA DA LISTA ==========
// Explicação: Percorre a lista do início ao fim, liberando (free) cada contato.
// Evita "vazamento de memória" (memory leak) - memória alocada que nunca é liberada.

void liberarLista(void) {
    Contato *ptr = cabeca;

    while (ptr != NULL) {
        Contato *prox = ptr->proximo;   // Guarda o endereço do próximo antes de liberar
        free(ptr);                      // Libera a memória deste contato
        ptr = prox;                     // Avança para o próximo
    }

    // Reseta todas as variáveis globais
    cabeca = NULL;
    cauda  = NULL;
    atual  = NULL;
}

// ========== FUNÇÃO PRINCIPAL (MAIN) ==========
// Explicação: Este é o "coração" do programa. É a primeira função executada.
// Configura o idioma, mostra o menu, recebe a escolha do usuário,
// e chama a função apropriada para cada opção.

int main(void) {

    // Configura o programa para usar acentos e caracteres do português brasileiro
    setlocale(LC_ALL, "Portuguese_Brazil.1252");

    int opcao;

    // Loop principal: repete até o usuário escolher 0 (sair)
    do {
        // ---- Mostra o menu ----
        printf(NEGRITO AMARELO "\n=== Lista Telefônica ===\n" RESET);
        printf(AMARELO "1. Exibir lista\n");
        printf("2. Inserir contato\n");
        printf("3. Buscar contato por nome\n");
        printf("4. Remover contato\n");
        printf("5. Navegar na lista\n");
        printf("6. Salvar em arquivo TXT\n");
        printf("7. Carregar arquivo TXT\n");
        printf("0. Sair\n" RESET);
        printf("Escolha uma opção: ");

        // Lê a opção do usuário
        if (scanf("%d", &opcao) != 1) {   // Se não conseguiu ler um número...
            limparBuffer();
            opcao = -1;   // Força opção inválida
        } else {
            limparBuffer();
        }

        // ---- Executa a ação correspondente ----
        switch (opcao) {
            case 1:
                system("cls");      // Limpa a tela
                exibirLista();      // Mostra todos os contatos
                break;

            case 2:
                system("cls");
                inserirContato();   // Adiciona um novo contato
                break;

            case 3:
                system("cls");
                buscarContato();    // Procura por nome
                break;

            case 4:
                system("cls");
                exibirLista();      // Mostra a lista primeiro
                removerContato();   // Depois pergunta qual remover
                break;

            case 5:
                system("cls");
                navegarLista();     // Navegação um a um
                break;

            case 6:
                system("cls");
                salvarEmTxt();      // Salva em arquivo
                break;

            case 7:
                system("cls");
                carregarDeArquivo(); // Carrega do arquivo
                break;

            case 0:
                system("cls");
                printf(AMARELO "Finalizando Programa...\n\n" RESET);
                printf(NEGRITO VERDE "\nPrograma concluído com sucesso!\n" PRETO);
                break;

            default:
                system("cls");
                printf(BG_VERMELHO NEGRITO "Opção inválida. Tente novamente.\n" RESET);
                break;
        }
    } while (opcao != 0);   // Continua até que opcao seja 0

    liberarLista();   // Antes de encerrar, libera toda a memória alocada

    return 0;   // Retorna 0 para o sistema operacional = "tudo certo!"
}


