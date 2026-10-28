package br.com.meusaldo.api;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lancamentos")
public class Lancamento {
    @Id
    private String id;
    private String perfilId;
    @NotBlank private String descricao;
    @NotNull @Positive private BigDecimal valor;
    @NotBlank private String categoria;
    @NotNull private Instant data;
    @NotBlank private String tipo;

    protected Lancamento() {}

    public Lancamento(String perfilId, Lancamento entrada) {
        this.id = UUID.randomUUID().toString();
        copiar(entrada);
        this.perfilId = perfilId;
    }

    public void atualizar(Lancamento entrada) { copiar(entrada); }

    private void copiar(Lancamento entrada) {
        this.descricao = entrada.descricao;
        this.valor = entrada.valor;
        this.categoria = entrada.categoria;
        this.data = entrada.data;
        this.tipo = entrada.tipo == null ? "saida" : entrada.tipo.toLowerCase();
    }

    public String getId() { return id; }
    public String getPerfilId() { return perfilId; }
    public String getDescricao() { return descricao; }
    public BigDecimal getValor() { return valor; }
    public String getCategoria() { return categoria; }
    public Instant getData() { return data; }
    public String getTipo() { return tipo; }
}
