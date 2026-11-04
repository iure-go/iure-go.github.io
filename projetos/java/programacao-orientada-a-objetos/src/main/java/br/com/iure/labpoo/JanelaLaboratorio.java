package br.com.iure.labpoo;

import java.awt.BorderLayout;
import java.awt.GridLayout;
import javax.swing.BorderFactory;
import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;

/**
 * Janela Swing que conecta os objetos do domínio a eventos da interface.
 * Para mudar os campos do formulário, ajuste construirFormulario().
 */
public class JanelaLaboratorio extends JFrame {
    private final Armario armario = new Armario();
    private final DefaultListModel<Equipamento> modelo = new DefaultListModel<>();
    private final JList<Equipamento> lista = new JList<>(modelo);
    private final JComboBox<String> tipo = new JComboBox<>(new String[]{"Notebook", "Projetor"});
    private final JTextField patrimonio = new JTextField();
    private final JTextField nome = new JTextField();
    private final JTextField especificacao = new JTextField();
    private final JLabel rotuloEspecificacao = new JLabel("Sistema operacional");
    private final JLabel status = new JLabel("Armário vazio.");

    public JanelaLaboratorio() {
        super("LabPOO · Equipamentos");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(720, 480);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(12, 12));

        JPanel formulario = construirFormulario();
        add(formulario, BorderLayout.NORTH);

        lista.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        lista.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        add(new JScrollPane(lista), BorderLayout.CENTER);

        JPanel rodape = construirAcoes();
        add(rodape, BorderLayout.SOUTH);

        tipo.addActionListener(evento -> atualizarRotuloEspecificacao());
        popularExemplos();
    }

    // Os rótulos e campos nesta grade compõem a janela de cadastro.
    private JPanel construirFormulario() {
        JPanel painel = new JPanel(new GridLayout(0, 2, 8, 8));
        painel.setBorder(BorderFactory.createEmptyBorder(14, 14, 4, 14));

        painel.add(new JLabel("Tipo"));
        painel.add(tipo);
        painel.add(new JLabel("Patrimônio"));
        painel.add(patrimonio);
        painel.add(new JLabel("Nome do equipamento"));
        painel.add(nome);
        painel.add(rotuloEspecificacao);
        painel.add(especificacao);

        JButton cadastrar = new JButton("Cadastrar equipamento");
        cadastrar.addActionListener(evento -> cadastrarEquipamento());
        painel.add(new JLabel());
        painel.add(cadastrar);
        return painel;
    }

    // Cada botão é um evento de interface que chama uma operação do domínio.
    private JPanel construirAcoes() {
        JPanel painel = new JPanel(new BorderLayout(8, 8));
        JPanel botoes = new JPanel();

        JButton ligarDesligar = new JButton("Ligar / desligar");
        ligarDesligar.addActionListener(evento -> alternarEstadoSelecionado());

        JButton remover = new JButton("Remover do armário");
        remover.addActionListener(evento -> removerSelecionado());

        botoes.add(ligarDesligar);
        botoes.add(remover);
        painel.add(botoes, BorderLayout.NORTH);
        painel.add(status, BorderLayout.SOUTH);
        painel.setBorder(BorderFactory.createEmptyBorder(4, 14, 14, 14));
        return painel;
    }

    private void atualizarRotuloEspecificacao() {
        boolean notebook = "Notebook".equals(tipo.getSelectedItem());
        rotuloEspecificacao.setText(notebook ? "Sistema operacional" : "Lumens");
        especificacao.setToolTipText(notebook
                ? "Ex.: Linux ou Windows"
                : "Informe um número inteiro, por exemplo 3200");
    }

    // Cria a subclasse escolhida, trata entradas inválidas e atualiza a coleção visual.
    private void cadastrarEquipamento() {
        try {
            String codigo = patrimonio.getText();
            String descricao = nome.getText();
            Equipamento novo;

            if ("Notebook".equals(tipo.getSelectedItem())) {
                novo = new Notebook(codigo, descricao, especificacao.getText());
            } else {
                int lumens = Integer.parseInt(especificacao.getText().trim());
                novo = new Projetor(codigo, descricao, lumens);
            }

            armario.adicionar(novo);
            modelo.addElement(novo);
            status.setText("Armário: " + armario.quantidade() + " equipamento(s).");
            patrimonio.setText("");
            nome.setText("");
            especificacao.setText("");
            patrimonio.requestFocusInWindow();
        } catch (IllegalArgumentException erro) {
            JOptionPane.showMessageDialog(
                    this, erro.getMessage(), "Não foi possível cadastrar", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void alternarEstadoSelecionado() {
        Equipamento selecionado = lista.getSelectedValue();
        if (selecionado == null) {
            JOptionPane.showMessageDialog(this, "Selecione um equipamento na lista.");
            return;
        }

        if (selecionado.estaLigado()) {
            selecionado.desligar();
        } else {
            selecionado.ligar();
        }
        lista.repaint();
        status.setText(selecionado.getNome() + ": "
                + (selecionado.estaLigado() ? "ligado." : "desligado."));
    }

    private void removerSelecionado() {
        Equipamento selecionado = lista.getSelectedValue();
        if (selecionado == null) {
            JOptionPane.showMessageDialog(this, "Selecione um equipamento para remover.");
            return;
        }

        armario.remover(selecionado.getPatrimonio());
        modelo.removeElement(selecionado);
        status.setText("Armário: " + armario.quantidade() + " equipamento(s).");
    }

    private void popularExemplos() {
        adicionarExemplo(new Notebook("NT-014", "Notebook de laboratório", "Ubuntu"));
        adicionarExemplo(new Projetor("PJ-006", "Projetor da sala", 3200));
    }

    private void adicionarExemplo(Equipamento equipamento) {
        armario.adicionar(equipamento);
        modelo.addElement(equipamento);
        status.setText("Exemplos carregados · " + armario.quantidade() + " equipamento(s).");
    }
}
