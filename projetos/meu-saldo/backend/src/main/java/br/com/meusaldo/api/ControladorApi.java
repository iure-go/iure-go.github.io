package br.com.meusaldo.api;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ControladorApi {
    private final RepositorioLancamentos lancamentos;
    private final RepositorioOrcamentos orcamentos;

    public ControladorApi(RepositorioLancamentos lancamentos, RepositorioOrcamentos orcamentos) {
        this.lancamentos = lancamentos;
        this.orcamentos = orcamentos;
    }

    @GetMapping("/health")
    public java.util.Map<String, String> health() { return java.util.Map.of("status", "ok"); }

    @GetMapping("/lancamentos")
    public List<Lancamento> listar(@RequestHeader("X-Perfil-Id") String perfilId) {
        return lancamentos.findAllByPerfilIdOrderByDataDesc(perfilId);
    }

    @PostMapping("/lancamentos")
    @ResponseStatus(HttpStatus.CREATED)
    public Lancamento criar(@RequestHeader("X-Perfil-Id") String perfilId, @Valid @RequestBody Lancamento entrada) {
        return lancamentos.save(new Lancamento(perfilId, entrada));
    }

    @PutMapping("/lancamentos/{id}")
    public Lancamento atualizar(@RequestHeader("X-Perfil-Id") String perfilId, @PathVariable String id, @Valid @RequestBody Lancamento entrada) {
        Lancamento existente = lancamentos.findByIdAndPerfilId(id, perfilId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lançamento não encontrado."));
        existente.atualizar(entrada);
        return lancamentos.save(existente);
    }

    @DeleteMapping("/lancamentos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@RequestHeader("X-Perfil-Id") String perfilId, @PathVariable String id) {
        Lancamento existente = lancamentos.findByIdAndPerfilId(id, perfilId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lançamento não encontrado."));
        lancamentos.delete(existente);
    }

    @GetMapping("/orcamento")
    public java.util.Map<String, BigDecimal> buscarOrcamento(@RequestHeader("X-Perfil-Id") String perfilId, @org.springframework.web.bind.annotation.RequestParam(defaultValue = "") String mes) {
        String mesAtual = mes.isBlank() ? java.time.YearMonth.now().toString() : mes;
        return java.util.Map.of("valor", orcamentos.findByPerfilIdAndMes(perfilId, mesAtual).map(Orcamento::getValor).orElse(BigDecimal.ZERO));
    }

    @PutMapping("/orcamento")
    public java.util.Map<String, BigDecimal> salvarOrcamento(@RequestHeader("X-Perfil-Id") String perfilId, @org.springframework.web.bind.annotation.RequestParam(defaultValue = "") String mes, @Valid @RequestBody AtualizacaoOrcamento entrada) {
        String mesAtual = mes.isBlank() ? java.time.YearMonth.now().toString() : mes;
        Orcamento orcamento = orcamentos.findByPerfilIdAndMes(perfilId, mesAtual).orElse(new Orcamento(perfilId, mesAtual, entrada.valor()));
        orcamento.setValor(entrada.valor());
        orcamentos.save(orcamento);
        return java.util.Map.of("valor", orcamento.getValor());
    }

    public record AtualizacaoOrcamento(@jakarta.validation.constraints.NotNull @jakarta.validation.constraints.PositiveOrZero BigDecimal valor) {}
}
