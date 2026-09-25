package com.retail.cotizaciones.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "items_cotizacion")
public class ItemCotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer numero;

    @Column(length = 600)
    private String descripcion;

    private String entrega;
    private Integer cantidad;

    @Column(precision = 12, scale = 2)
    private BigDecimal precio;
    @Column(precision = 12, scale = 2)
    private BigDecimal total;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "item_caracteristicas", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "caracteristica", length = 600)
    private List<String> caracteristicas = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cotizacion_id")
    private Cotizacion cotizacion;

    // --- getters / setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String v) { this.descripcion = v; }
    public String getEntrega() { return entrega; }
    public void setEntrega(String v) { this.entrega = v; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer v) { this.cantidad = v; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal v) { this.precio = v; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal v) { this.total = v; }
    public List<String> getCaracteristicas() { return caracteristicas; }
    public void setCaracteristicas(List<String> v) { this.caracteristicas = v; }
    public Cotizacion getCotizacion() { return cotizacion; }
    public void setCotizacion(Cotizacion c) { this.cotizacion = c; }
}
