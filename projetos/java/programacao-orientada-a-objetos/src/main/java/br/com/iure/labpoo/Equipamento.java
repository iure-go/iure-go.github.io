package br.com.iure.labpoo;

/**
 * Classe-base compartilhada pelos equipamentos do laboratório.
 * Campos privados protegem o estado; subclasses especializam detalhesTecnicos().
 */
public abstract class Equipamento implements Ligavel {
    private final String patrimonio;
    private final String nome;
    private boolean ligado;

    protected Equipamento(String patrimonio, String nome) {
        this.patrimonio = validarTexto(patrimonio, "Patrimônio");
        this.nome = validarTexto(nome, "Nome");
        this.ligado = false;
    }

    // Centralize validações comuns aqui para reaproveitar nas subclasses.
    protected static String validarTexto(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(campo + " é obrigatório.");
        }
        return valor.trim();
    }

    public String getPatrimonio() {
        return patrimonio;
    }

    public String getNome() {
        return nome;
    }

    @Override
    public boolean estaLigado() {
        return ligado;
    }

    @Override
    public void ligar() {
        ligado = true;
    }

    @Override
    public void desligar() {
        ligado = false;
    }

    // Cada tipo concreto informa seus próprios detalhes por polimorfismo.
    public abstract String detalhesTecnicos();

    public String resumo() {
        String estado = ligado ? "Ligado" : "Desligado";
        return "[" + patrimonio + "] " + nome + " · " + detalhesTecnicos() + " · " + estado;
    }

    @Override
    public String toString() {
        return resumo();
    }
}
