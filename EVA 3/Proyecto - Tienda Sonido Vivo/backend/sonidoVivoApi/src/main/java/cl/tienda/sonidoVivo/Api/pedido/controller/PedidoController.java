package cl.tienda.sonidoVivo.Api.pedido.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.tienda.sonidoVivo.Api.common.ApiResponse;
import cl.tienda.sonidoVivo.Api.pedido.dto.ActualizarEstadoPedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoResponse;
import cl.tienda.sonidoVivo.Api.pedido.model.EstadoPedido;
import cl.tienda.sonidoVivo.Api.pedido.service.PedidoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // Crear pedido desde Checkout
    @PostMapping
    public ResponseEntity<ApiResponse<PedidoResponse>> crearPedido(
            @Valid @RequestBody PedidoRequest request) {
        PedidoResponse creado = pedidoService.crearPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.exito(creado, "Pedido registrado correctamente"));
    }

    // Listar todos los pedidos (Panel Vendedor / Admin). Filtro opcional ?estado=EN_PREPARACION
    @GetMapping
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> listarPedidos(
            @RequestParam(required = false) EstadoPedido estado) {
        return ResponseEntity.ok(ApiResponse.exito(pedidoService.listarTodos(estado)));
    }

    // Listar pedidos de un cliente (cuando Benjamín ponga JWT, se reemplazará por el usuario del token)
    @GetMapping("/cliente/{usuarioId}")
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> listarPedidosCliente(
            @PathVariable Long usuarioId) {
        return ResponseEntity.ok(ApiResponse.exito(pedidoService.listarPorCliente(usuarioId)));
    }

    // Actualizar estado del pedido (Panel Vendedor / Admin)
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<PedidoResponse>> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoPedidoRequest request) {
        PedidoResponse actualizado = pedidoService.actualizarEstado(id, request.estado());
        return ResponseEntity.ok(ApiResponse.exito(actualizado, "Estado del pedido actualizado"));
    }
}