
package cl.tienda.sonidoVivo.Api.pedido.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import cl.tienda.sonidoVivo.Api.common.ApiResponse;
import cl.tienda.sonidoVivo.Api.pedido.dto.ActualizarEstadoPedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoResponse;
import cl.tienda.sonidoVivo.Api.pedido.model.EstadoPedido;
import cl.tienda.sonidoVivo.Api.pedido.service.PedidoService;
import cl.tienda.sonidoVivo.Api.usuario.model.Usuario;
import cl.tienda.sonidoVivo.Api.usuario.repository.UsuarioRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(
            PedidoService pedidoService,
            UsuarioRepository usuarioRepository) {
        this.pedidoService = pedidoService;
        this.usuarioRepository = usuarioRepository;
    }

    // Registrar pedido usando el usuario autenticado.
    @PostMapping
    public ResponseEntity<ApiResponse<PedidoResponse>> crearPedido(
            @Valid @RequestBody PedidoRequest request,
            @AuthenticationPrincipal UserDetails usuarioAutenticado) {

        Long usuarioId = obtenerUsuarioId(usuarioAutenticado);

        PedidoResponse creado = pedidoService.crearPedido(request, usuarioId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.exito(
                        creado,
                        "Pedido registrado correctamente"));
    }

    // Listar pedidos del cliente autenticado.
    @GetMapping("/mis-pedidos")
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> listarMisPedidos(
            @AuthenticationPrincipal UserDetails usuarioAutenticado) {

        Long usuarioId = obtenerUsuarioId(usuarioAutenticado);

        return ResponseEntity.ok(
                ApiResponse.exito(
                        pedidoService.listarPorCliente(usuarioId)));
    }

    // Obtener detalle de un pedido.
    // CLIENTE: solo puede consultar sus propios pedidos.
    // VENDEDOR y ADMIN: pueden consultar cualquier pedido.
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PedidoResponse>> obtenerPedido(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails usuarioAutenticado) {

        if (usuarioAutenticado == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión para consultar el pedido");
        }

        boolean esCliente = usuarioAutenticado.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(autoridad -> autoridad.equals("ROLE_CLIENTE"));

        PedidoResponse pedido;

        if (esCliente) {
            Long usuarioId = obtenerUsuarioId(usuarioAutenticado);
            pedido = pedidoService.obtenerPorIdCliente(id, usuarioId);
        } else {
            pedido = pedidoService.obtenerPorId(id);
        }

        return ResponseEntity.ok(
                ApiResponse.exito(pedido));
    }

    // Listar todos los pedidos para vendedor y administrador.
    // Filtro opcional: ?estado=EN_PREPARACION
    @GetMapping
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> listarPedidos(
            @RequestParam(required = false) EstadoPedido estado) {

        return ResponseEntity.ok(
                ApiResponse.exito(
                        pedidoService.listarTodos(estado)));
    }

    // Actualizar estado del pedido.
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<PedidoResponse>> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoPedidoRequest request) {

        PedidoResponse actualizado =
                pedidoService.actualizarEstado(id, request.estado());

        return ResponseEntity.ok(
                ApiResponse.exito(
                        actualizado,
                        "Estado del pedido actualizado"));
    }

    private Long obtenerUsuarioId(UserDetails usuarioAutenticado) {

        if (usuarioAutenticado == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión para realizar esta operación");
        }

        Usuario usuario = usuarioRepository
                .findByCorreo(usuarioAutenticado.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "No se encontró el usuario autenticado"));

        if (!usuario.isActivo()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta de usuario está desactivada");
        }

        return usuario.getId();
    }
}
