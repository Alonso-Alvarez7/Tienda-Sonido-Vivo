package cl.tienda.sonidoVivo.Api.usuario.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.tienda.sonidoVivo.Api.usuario.dto.RegistroRequest;
import cl.tienda.sonidoVivo.Api.usuario.model.Rol;
import cl.tienda.sonidoVivo.Api.usuario.model.Usuario;
import cl.tienda.sonidoVivo.Api.usuario.repository.RolRepository;
import cl.tienda.sonidoVivo.Api.usuario.repository.UsuarioRepository;

@Service
@Transactional
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void registrarCliente(RegistroRequest solicitud) {
        String correo = solicitud.correo().trim().toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByCorreo(correo)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una cuenta con ese correo");
        }

        Rol rolCliente = rolRepository.findByNombre("CLIENTE")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "No está configurado el rol CLIENTE"));

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(solicitud.nombre().trim());
        usuario.setCorreo(correo);
        usuario.setPasswordHash(passwordEncoder.encode(solicitud.clave()));
        usuario.setActivo(true);
        usuario.setRol(rolCliente);

        usuarioRepository.save(usuario);
    }
}