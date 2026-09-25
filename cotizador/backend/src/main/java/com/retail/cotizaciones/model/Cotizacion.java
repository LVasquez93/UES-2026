package com.retail.cotizaciones.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cotizaciones")
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Correlativo legible, formato yyyyMMddNNN (ej. 20260625001). */
    @Column(nullable = false, unique = true)
    private String numero;

    @Column(nullable = false)
    private LocalDate fecha;

    private String usuario;
    private String clienteNombre;
    private String clienteEmpresa;
    private String clienteDepartamento;

    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal;
    @Column(precision = 12, scale = 2)
    private BigDecimal iva;
    @Column(precision = 12, scale = 2)
    private BigDecimal total;

    @Column(length = 400)
    private String totalLetras;

    @Column(length = 500)
    private String formaPago;
    @Column(length = 500)
    private String nota;

    /** Ruta del PDF generado en disco. */
    private String pdfPath;

    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCotizacion> items = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
    }

    public void addItem(ItemCotizacion item) {
        item.setCotizacion(this);
        items.add(item);
    }

    // --- getters / setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String v) { this.clienteNombre = v; }
    public String getClienteEmpresa() { return clienteEmpresa; }
    public void setClienteEmpresa(String v) { this.clienteEmpresa = v; }
    public String getClienteDepartamento() { return clienteDepartamento; }
    public void setClienteDepartamento(String v) { this.clienteDepartamento = v; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal v) { this.subtotal = v; }
    public BigDecimal getIva() { return iva; }
    public void setIva(BigDecimal v) { this.iva = v; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal v) { this.total = v; }
    public String getTotalLetras() { return totalLetras; }
    public void setTotalLetras(String v) { this.totalLetras = v; }
    public String getFormaPago() { return formaPago; }
    public void setFormaPago(String v) { this.formaPago = v; }
    public String getNota() { return nota; }
    public void setNota(String v) { this.nota = v; }
    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String v) { this.pdfPath = v; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime v) { this.creadoEn = v; }
    public List<ItemCotizacion> getItems() { return items; }
    public void setItems(List<ItemCotizacion> items) { this.items = items; }
}
