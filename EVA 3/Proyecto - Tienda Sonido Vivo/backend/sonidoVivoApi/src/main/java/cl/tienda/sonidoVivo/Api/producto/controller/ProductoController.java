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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;

import cl.tienda.sonidoVivo.Api.producto.dto.ActualizarStockRequest;
import cl.tienda.sonidoVivo.Api.common.ApiResponse;
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

    // Listar productos activos. Filtros opcionales:
    // ?texto=yamaha&categoria=Baterías
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductoResponse>>> listarProductos(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) String categoria) {

        return ResponseEntity.ok(
                ApiResponse.exito(productoService.listarProductos(texto, categoria)));
    }

    // Obtener un producto por su código (GA001, ...)
    @GetMapping("/{codigo}")
    public ResponseEntity<ApiResponse<ProductoResponse>> obtenerProducto(
            @PathVariable String codigo) {

        return ResponseEntity.ok(
                ApiResponse.exito(productoService.obtenerProducto(codigo)));
    }

    // Crear un producto
    @PostMapping
    public ResponseEntity<ApiResponse<ProductoResponse>> crearProducto(
            @Valid @RequestBody ProductoRequest request) {

        ProductoResponse productoCreado = productoService.crearProducto(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.exito(productoCreado, "Producto creado correctamente"));
    }

    // Actualizar un producto
    @PutMapping("/{codigo}")
    public ResponseEntity<ApiResponse<ProductoResponse>> actualizarProducto(
            @PathVariable String codigo,
            @Valid @RequestBody ProductoRequest request) {

        return ResponseEntity.ok(
                ApiResponse.exito(
                        productoService.actualizarProducto(codigo, request),
                        "Producto actualizado correctamente"));
    }

    // Desactivar un producto (baja lógica), no lo elimina
    @DeleteMapping("/{codigo}")
    public ResponseEntity<ApiResponse<Void>> desactivarProducto(
            @PathVariable String codigo) {

        productoService.desactivarProducto(codigo);

        return ResponseEntity.ok(ApiResponse.exito(null, "Producto desactivado correctamente"));
    }

    // Reactivar un producto
    @PatchMapping("/{codigo}/activar")
    public ResponseEntity<ApiResponse<Void>> activarProducto(
            @PathVariable String codigo) {

        productoService.activarProducto(codigo);

        return ResponseEntity.ok(
                ApiResponse.exito(null, "Producto activado correctamente"));
    }

    // Agrega este endpoint dentro de la clase ProductoController:
    // Actualizar solo el stock de un producto (VENDEDOR y ADMIN)
    @PatchMapping("/{codigo}/stock")
    public ResponseEntity<ApiResponse<ProductoResponse>> actualizarStock(
            @PathVariable String codigo,
            @Valid @RequestBody ActualizarStockRequest request) {

        return ResponseEntity.ok(
                ApiResponse.exito(
                        productoService.actualizarStock(codigo, request.stock()),
                        "Stock actualizado correctamente"));
    }
}