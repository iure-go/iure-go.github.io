package br.com.meusaldo.api;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RepositorioOrcamentos extends JpaRepository<Orcamento, String> {
    Optional<Orcamento> findByPerfilIdAndMes(String perfilId, String mes);
}
