package br.com.iure.labpoo;

/**
 * Contrato comum para equipamentos que podem mudar de estado.
 * Adicione aqui operações que todos os equipamentos devem oferecer.
 */
public interface Ligavel {
    void ligar();
    void desligar();
    boolean estaLigado();
}
