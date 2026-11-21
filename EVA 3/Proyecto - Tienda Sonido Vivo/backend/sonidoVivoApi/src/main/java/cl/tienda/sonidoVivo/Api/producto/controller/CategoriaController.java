package cl.tienda.sonidoVivo.Api.producto.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.tienda.sonidoVivo.Api.common.ApiResponse;
import cl.tienda.sonidoVivo.Api.producto.dto.CategoriaResponse;
import cl.tienda.sonidoVivo.Api.producto.service.CategoriaService;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoriaResponse>>> listarCategorias() {
        return ResponseEntity.ok(ApiResponse.exito(categoriaService.listarCategorias()));
    }
}