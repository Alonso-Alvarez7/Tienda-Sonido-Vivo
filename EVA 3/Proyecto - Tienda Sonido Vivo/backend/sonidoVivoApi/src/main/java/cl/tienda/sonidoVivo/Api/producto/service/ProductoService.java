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
    // LISTAR PRODUCTOS ACTIVOS (con filtros)
    // ==========================================

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarProductos(String texto, String categoria) {

        String textoNormalizado = texto == null ? "" : texto.trim();
        String categoriaNormalizada =
                (categoria == null || categoria.isBlank() || categoria.equalsIgnoreCase("Todas"))
                        ? ""
                        : categoria.trim();

        return productoRepository.buscarActivos(textoNormalizado, categoriaNormalizada)
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }

    // ==========================================
    // BUSCAR PRODUCTO POR CÓDIGO
    // ==========================================

    @Transactional(readOnly = true)
    public ProductoResponse obtenerProducto(String codigo) {

        Producto producto = buscarPorCodigo(codigo);

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
            String codigo,
            ProductoRequest request) {

        Producto producto = buscarPorCodigo(codigo);

        validarCodigoDisponible(request.codigo(), producto.getId());

        Categoria categoria = buscarCategoria(request.categoriaId());

        copiarDatos(request, producto, categoria);

        Producto productoActualizado = productoRepository.save(producto);

        return convertirAResponse(productoActualizado);
    }

    // ==========================================
    // DESACTIVAR PRODUCTO (BAJA LÓGICA)
    // ==========================================

    public void desactivarProducto(String codigo) {

        Producto producto = buscarPorCodigo(codigo);

        producto.setActivo(false);

        productoRepository.save(producto);
    }

    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================

    private Producto buscarPorCodigo(String codigo) {

        return productoRepository.findByCodigo(codigo.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el producto con código: " + codigo));
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
                producto.getCodigo(),
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