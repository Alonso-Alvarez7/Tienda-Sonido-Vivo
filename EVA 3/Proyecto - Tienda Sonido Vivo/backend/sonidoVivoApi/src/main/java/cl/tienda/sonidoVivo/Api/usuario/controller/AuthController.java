package cl.tienda.sonidoVivo.Api.usuario.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.tienda.sonidoVivo.Api.common.ApiResponse;
import cl.tienda.sonidoVivo.Api.usuario.dto.AutenticacionResponse;
import cl.tienda.sonidoVivo.Api.usuario.dto.LoginRequest;
import cl.tienda.sonidoVivo.Api.usuario.dto.RegistroRequest;
import cl.tienda.sonidoVivo.Api.usuario.model.Usuario;
import cl.tienda.sonidoVivo.Api.usuario.repository.UsuarioRepository;
import cl.tienda.sonidoVivo.Api.usuario.service.AuthService;
import cl.tienda.sonidoVivo.Api.usuario.service.JwtService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            AuthenticationManager authenticationManager,
            UsuarioRepository usuarioRepository,
            JwtService jwtService) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/registro")
    public ResponseEntity<ApiResponse<Void>> registrar(
            @Valid @RequestBody RegistroRequest solicitud) {
        authService.registrarCliente(solicitud);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Void>exito(null, "Cuenta creada correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AutenticacionResponse>> login(
            @Valid @RequestBody LoginRequest solicitud) {

        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        solicitud.correo().trim().toLowerCase(),
                        solicitud.clave()));

        Usuario usuario = usuarioRepository.findByCorreo(autenticacion.getName())
                .orElseThrow();

        String rolToken = autenticacion.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_CLIENTE")
                .replace("ROLE_", "");

        String rolFrontend = switch (rolToken) {
            case "ADMIN" -> "administrador";
            case "VENDEDOR" -> "vendedor";
            default -> "cliente";
        };

        String token = jwtService.generarToken(usuario.getCorreo(), rolToken);

        AutenticacionResponse respuesta = new AutenticacionResponse(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getCorreo(),
                rolFrontend,
                token,
                System.currentTimeMillis() + 8 * 60 * 60 * 1000L);

        return ResponseEntity.ok(
                ApiResponse.exito(respuesta, "Inicio de sesión correcto"));
    }
}