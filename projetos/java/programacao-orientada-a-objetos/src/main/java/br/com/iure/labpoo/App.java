package br.com.iure.labpoo;

import javax.swing.SwingUtilities;

/** Inicia a janela na fila de eventos do Swing. */
public class App {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JanelaLaboratorio janela = new JanelaLaboratorio();
            janela.setVisible(true);
        });
    }
}
