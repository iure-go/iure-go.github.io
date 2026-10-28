package br.com.meusaldo.api;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioLancamentos extends JpaRepository<Lancamento, String> {
    List<Lancamento> findAllByPerfilIdOrderByDataDesc(String perfilId);
    Optional<Lancamento> findByIdAndPerfilId(String id, String perfilId);
}
