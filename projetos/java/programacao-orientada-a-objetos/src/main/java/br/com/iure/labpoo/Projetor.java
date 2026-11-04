package br.com.iure.labpoo;

/** Projetor especializa Equipamento com a quantidade de lumens. */
public class Projetor extends Equipamento {
    private final int lumens;

    public Projetor(String patrimonio, String nome, int lumens) {
        super(patrimonio, nome);
        if (lumens <= 0) {
            throw new IllegalArgumentException("Lumens deve ser um número positivo.");
        }
        this.lumens = lumens;
    }

    @Override
    public String detalhesTecnicos() {
        return "Projetor · " + lumens + " lumens";
    }
}
