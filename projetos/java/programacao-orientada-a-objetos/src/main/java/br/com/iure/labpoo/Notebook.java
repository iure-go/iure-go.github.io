package br.com.iure.labpoo;

/** Notebook herda os dados e comportamentos comuns de Equipamento. */
public class Notebook extends Equipamento {
    private final String sistemaOperacional;

    public Notebook(String patrimonio, String nome, String sistemaOperacional) {
        super(patrimonio, nome);
        this.sistemaOperacional = validarTexto(sistemaOperacional, "Sistema operacional");
    }

    @Override
    public String detalhesTecnicos() {
        return "Notebook · SO: " + sistemaOperacional;
    }
}
