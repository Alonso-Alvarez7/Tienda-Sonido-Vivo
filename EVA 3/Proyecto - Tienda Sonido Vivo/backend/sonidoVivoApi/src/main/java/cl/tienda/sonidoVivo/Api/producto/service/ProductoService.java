package cl.tienda.sonidoVivo.Api.producto.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.tienda.sonidoVivo.Api.producto.dto.ProductoRequest;
import cl.tienda.sonidoVivo.Api.producto.dto.ProductoResponse;
import cl.tienda.sonidoVivo.Api.producto.model.Categoria;
import cl.tienda.sonidoVivo.Api.producto.model.Producto;
import cl.tienda.sonidoVivo.Api.producto.repository.CategoriaRepository;
import cl.tienda.sonidoVivo.Api.producto.repository.ProductoRepository;

@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository) {

        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // ==========================================
    // LISTAR PRODUCTOS ACTIVOS
    // ==========================================

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarProductos() {

        return productoRepository.findAll()
                .stream()
                .filter(Producto::isActivo)
                .map(this::convertirAResponse)
                .toList();
    }

    // ==========================================
    // BUSCAR PRODUCTO POR ID
    // ==========================================

    @Transactional(readOnly = true)
    public ProductoResponse obtenerProducto(Long id) {

        Producto producto = buscarPorId(id);

        if (!producto.isActivo()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "El producto no está disponible");
        }

        return convertirAResponse(producto);
    }

    // ==========================================
    // CREAR PRODUCTO
    // ==========================================

    public ProductoResponse crearProducto(ProductoRequest request) {

        validarCodigoDisponible(request.codigo(), null);

        Categoria categoria = buscarCategoria(request.categoriaId());

        Producto producto = new Producto();

        copiarDatos(request, producto, categoria);
        producto.setActivo(true);

        Producto productoGuardado = productoRepository.save(producto);

        return convertirAResponse(productoGuardado);
    }

    // ==========================================
    // ACTUALIZAR PRODUCTO
    // ==========================================

    public ProductoResponse actualizarProducto(
            Long id,
            ProductoRequest request) {

        Producto producto = buscarPorId(id);

        validarCodigoDisponible(request.codigo(), id);

        Categoria categoria = buscarCategoria(request.categoriaId());

        copiarDatos(request, producto, categoria);

        Producto productoActualizado = productoRepository.save(producto);

        return convertirAResponse(productoActualizado);
    }

    // ==========================================
    // DESACTIVAR PRODUCTO (BAJA LÓGICA)
    // ==========================================

    public void desactivarProducto(Long id) {

        Producto producto = buscarPorId(id);

        producto.setActivo(false);

        productoRepository.save(producto);
    }

    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================

    private Producto buscarPorId(Long id) {

        return productoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el producto con ID: " + id));
    }

    private Categoria buscarCategoria(Long categoriaId) {

        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró la categoría con ID: " + categoriaId));
    }

    private void validarCodigoDisponible(String codigo, Long idActual) {

        String codigoNormalizado = codigo.trim();

        productoRepository.findByCodigo(codigoNormalizado)
                .ifPresent(producto -> {

                    if (idActual == null || !producto.getId().equals(idActual)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Ya existe un producto con el código: " + codigoNormalizado);
                    }
                });
    }

    private void copiarDatos(
            ProductoRequest request,
            Producto producto,
            Categoria categoria) {

        producto.setCodigo(request.codigo().trim());
        producto.setNombre(request.nombre().trim());
        producto.setMarca(request.marca().trim());
        producto.setModelo(request.modelo());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setStock(request.stock());
        producto.setImagen(request.imagen());
        producto.setCategoria(categoria);
    }

    private ProductoResponse convertirAResponse(Producto producto) {

        return new ProductoResponse(
                producto.getId(),
                producto.getCodigo(),
                producto.getNombre(),
                producto.getMarca(),
                producto.getModelo(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getStock(),
                producto.getImagen(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre(),
                producto.isActivo()
        );
    }
}
