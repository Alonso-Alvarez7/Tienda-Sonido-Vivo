package cl.tienda.sonidoVivo.Api.producto.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.tienda.sonidoVivo.Api.producto.dto.CategoriaResponse;
import cl.tienda.sonidoVivo.Api.producto.repository.CategoriaRepository;

@Service
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarCategorias() {
        return categoriaRepository.findAll()
                .stream()
                .map(categoria -> new CategoriaResponse(
                        categoria.getId(),
                        categoria.getNombre(),
                        categoria.getDescripcion()
                ))
                .toList();
    }
}