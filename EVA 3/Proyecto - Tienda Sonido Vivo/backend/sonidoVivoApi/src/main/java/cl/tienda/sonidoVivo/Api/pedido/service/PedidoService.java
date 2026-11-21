package cl.tienda.sonidoVivo.Api.pedido.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.tienda.sonidoVivo.Api.pedido.dto.DetallePedidoResponse;
import cl.tienda.sonidoVivo.Api.pedido.dto.ItemPedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoResponse;
import cl.tienda.sonidoVivo.Api.pedido.model.DetallePedido;
import cl.tienda.sonidoVivo.Api.pedido.model.EstadoPedido;
import cl.tienda.sonidoVivo.Api.pedido.model.Pedido;
import cl.tienda.sonidoVivo.Api.pedido.model.TipoEntrega;
import cl.tienda.sonidoVivo.Api.pedido.repository.PedidoRepository;
import cl.tienda.sonidoVivo.Api.producto.model.Producto;
import cl.tienda.sonidoVivo.Api.producto.repository.ProductoRepository;

@Service
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    public PedidoResponse crearPedido(PedidoRequest request) {
        if (request.tipoEntrega() == TipoEntrega.DESPACHO
                && (request.direccion() == null || request.direccion().isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La dirección es obligatoria para pedidos con despacho");
        }

        // Agrupar cantidades por código de producto para evitar violar uk_detalle_pedido_producto
        Map<String, Integer> cantidadesPorCodigo = new HashMap<>();
        for (ItemPedidoRequest item : request.items()) {
            String codigo = item.codigoProducto().trim();
            cantidadesPorCodigo.merge(codigo, item.cantidad(), Integer::sum);
        }

        Pedido pedido = new Pedido();
        pedido.setUsuarioId(request.usuarioId() != null ? request.usuarioId() : 0L);
        pedido.setTipoEntrega(request.tipoEntrega());
        pedido.setDireccion(request.tipoEntrega() == TipoEntrega.DESPACHO ? request.direccion().trim() : null);
        pedido.setTelefonoContacto(request.telefonoContacto().trim());
        pedido.setEstado(EstadoPedido.EN_PREPARACION);

        for (Map.Entry<String, Integer> entrada : cantidadesPorCodigo.entrySet()) {
            String codigo = entrada.getKey();
            int cantidadSolicitada = entrada.getValue();

            Producto producto = productoRepository.findByCodigo(codigo)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Producto no encontrado: " + codigo));

            if (!producto.isActivo()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto '" + producto.getNombre() + "' no está disponible");
            }

            if (producto.getStock() < cantidadSolicitada) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stock insuficiente para '" + producto.getNombre() + "'. Disponible: " + producto.getStock());
            }

            // Descuento de stock (protegido por @Version en Producto)
            producto.setStock(producto.getStock() - cantidadSolicitada);
            productoRepository.save(producto);

            pedido.agregarDetalle(DetallePedido.desde(producto, cantidadSolicitada));
        }

        // Primer save para obtener el ID autogenerado y luego asignar PED-XXXX
        Pedido guardado = pedidoRepository.save(pedido);
        guardado.asignarCodigo();
        guardado = pedidoRepository.save(guardado);

        return convertirAResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos(EstadoPedido estado) {
        return pedidoRepository.listarTodosConDetalles(estado)
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarPorCliente(Long usuarioId) {
        return pedidoRepository.listarPorUsuarioId(usuarioId)
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }

    public PedidoResponse actualizarEstado(Long id, EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el pedido con ID: " + id));

        pedido.setEstado(nuevoEstado);
        return convertirAResponse(pedidoRepository.save(pedido));
    }

    private PedidoResponse convertirAResponse(Pedido pedido) {
        List<DetallePedidoResponse> items = pedido.getDetalles().stream()
                .map(d -> new DetallePedidoResponse(
                        d.getProducto().getCodigo(),
                        d.getNombreProducto(),
                        d.getPrecioUnitario(),
                        d.getCantidad(),
                        d.getSubtotal()))
                .toList();

        return new PedidoResponse(
                pedido.getId(),
                pedido.getCodigo(),
                pedido.getUsuarioId(),
                pedido.getFecha(),
                pedido.getEstado().getEtiqueta(),
                pedido.getTipoEntrega().name().toLowerCase(),
                pedido.getDireccion() != null ? pedido.getDireccion() : "",
                pedido.getTelefonoContacto(),
                pedido.getTotal(),
                items);
    }
}