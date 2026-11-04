package br.com.iure.labpoo;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Guarda a coleção de equipamentos e protege seu acesso com métodos.
 * List.copyOf devolve uma cópia de leitura, sem expor a lista interna.
 */
public class Armario {
    private final List<Equipamento> equipamentos = new ArrayList<>();

    public void adicionar(Equipamento equipamento) {
        if (equipamento == null) {
            throw new IllegalArgumentException("Informe um equipamento.");
        }

        boolean patrimonioDuplicado = equipamentos.stream()
                .anyMatch(item -> item.getPatrimonio().equalsIgnoreCase(equipamento.getPatrimonio()));
        if (patrimonioDuplicado) {
            throw new IllegalArgumentException("Já existe um equipamento com esse patrimônio.");
        }

        equipamentos.add(equipamento);
    }

    public boolean remover(String patrimonio) {
        if (patrimonio == null) {
            return false;
        }
        return equipamentos.removeIf(
                item -> item.getPatrimonio().equalsIgnoreCase(patrimonio.trim()));
    }

    public Optional<Equipamento> buscar(String patrimonio) {
        if (patrimonio == null) {
            return Optional.empty();
        }
        return equipamentos.stream()
                .filter(item -> item.getPatrimonio().equalsIgnoreCase(patrimonio.trim()))
                .findFirst();
    }

    public List<Equipamento> listar() {
        return List.copyOf(equipamentos);
    }

    public int quantidade() {
        return equipamentos.size();
    }
}
