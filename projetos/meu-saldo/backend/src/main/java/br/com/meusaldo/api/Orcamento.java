package br.com.meusaldo.api;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

@Entity
@Table(name = "orcamentos")
public class Orcamento {
    @Id private String id;
    private String perfilId;
    private String mes;
    @NotNull @PositiveOrZero private BigDecimal valor;

    protected Orcamento() {}
    public Orcamento(String perfilId, String mes, BigDecimal valor) { this.id = perfilId + ":" + mes; this.perfilId = perfilId; this.mes = mes; this.valor = valor; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
}
