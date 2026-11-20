package cl.tienda.sonidoVivo.Api.producto.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.tienda.sonidoVivo.Api.producto.dto.ProductoRequest;
import cl.tienda.sonidoVivo.Api.producto.dto.ProductoResponse;
import cl.tienda.sonidoVivo.Api.producto.service.ProductoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // Listar todos los productos activos
    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listarProductos() {
        return ResponseEntity.ok(productoService.listarProductos());
    }

    // Obtener un producto por su ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtenerProducto(
            @PathVariable Long id) {

        return ResponseEntity.ok(productoService.obtenerProducto(id));
    }

    // Crear un producto
    @PostMapping
    public ResponseEntity<ProductoResponse> crearProducto(
            @Valid @RequestBody ProductoRequest request) {

        ProductoResponse productoCreado =
                productoService.crearProducto(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productoCreado);
    }

    // Actualizar un producto
    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequest request) {

        return ResponseEntity.ok(
                productoService.actualizarProducto(id, request));
    }

    // Desactivar un producto (baja lógica), no lo elimina
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarProducto(
            @PathVariable Long id) {

        productoService.desactivarProducto(id);

        return ResponseEntity.noContent().build();
    }
}
