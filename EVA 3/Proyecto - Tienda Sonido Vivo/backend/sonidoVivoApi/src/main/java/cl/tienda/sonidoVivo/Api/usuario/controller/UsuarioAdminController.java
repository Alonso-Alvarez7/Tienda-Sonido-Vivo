package cl.tienda.sonidoVivo.Api.usuario.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.tienda.sonidoVivo.Api.common.ApiResponse;
import cl.tienda.sonidoVivo.Api.usuario.dto.CambiarEstadoUsuarioRequest;
import cl.tienda.sonidoVivo.Api.usuario.dto.CambiarRolRequest;
import cl.tienda.sonidoVivo.Api.usuario.dto.CrearUsuarioRequest;
import cl.tienda.sonidoVivo.Api.usuario.dto.UsuarioAdminResponse;
import cl.tienda.sonidoVivo.Api.usuario.service.UsuarioAdminService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioAdminController {

    private final UsuarioAdminService usuarioAdminService;

    public UsuarioAdminController(UsuarioAdminService usuarioAdminService) {
        this.usuarioAdminService = usuarioAdminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UsuarioAdminResponse>>> listar() {
        return ResponseEntity.ok(
                ApiResponse.exito(usuarioAdminService.listar()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> crear(
            @Valid @RequestBody CrearUsuarioRequest solicitud) {
        UsuarioAdminResponse creado = usuarioAdminService.crear(solicitud);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.exito(creado, "Usuario creado correctamente"));
    }

    @PatchMapping("/{id}/rol")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> cambiarRol(
            @PathVariable Long id,
            @Valid @RequestBody CambiarRolRequest solicitud,
            Authentication autenticacion) {
        UsuarioAdminResponse actualizado = usuarioAdminService.cambiarRol(
                id,
                solicitud,
                autenticacion.getName());

        return ResponseEntity.ok(
                ApiResponse.exito(actualizado, "Rol actualizado correctamente"));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoUsuarioRequest solicitud,
            Authentication autenticacion) {
        UsuarioAdminResponse actualizado = usuarioAdminService.cambiarEstado(
                id,
                solicitud,
                autenticacion.getName());

        return ResponseEntity.ok(
                ApiResponse.exito(actualizado, "Estado del usuario actualizado"));
    }
}