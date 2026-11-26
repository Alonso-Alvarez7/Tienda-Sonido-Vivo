package cl.tienda.sonidoVivo.Api.usuario.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.tienda.sonidoVivo.Api.usuario.dto.CambiarEstadoUsuarioRequest;
import cl.tienda.sonidoVivo.Api.usuario.dto.CambiarRolRequest;
import cl.tienda.sonidoVivo.Api.usuario.dto.CrearUsuarioRequest;
import cl.tienda.sonidoVivo.Api.usuario.dto.UsuarioAdminResponse;
import cl.tienda.sonidoVivo.Api.usuario.model.Rol;
import cl.tienda.sonidoVivo.Api.usuario.model.Usuario;
import cl.tienda.sonidoVivo.Api.usuario.repository.RolRepository;
import cl.tienda.sonidoVivo.Api.usuario.repository.UsuarioRepository;

@Service
@Transactional
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioAdminService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioAdminResponse crear(CrearUsuarioRequest solicitud) {
        String correo = solicitud.correo().trim().toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByCorreo(correo)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un usuario con ese correo");
        }

        String nombreRol = solicitud.rol().trim().toUpperCase(Locale.ROOT);
        Rol rol = buscarRol(nombreRol);

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(solicitud.nombre().trim());
        usuario.setCorreo(correo);
        usuario.setPasswordHash(passwordEncoder.encode(solicitud.clave()));
        usuario.setActivo(true);
        usuario.setRol(rol);

        return convertir(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioAdminResponse> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::convertir)
                .toList();
    }

    public UsuarioAdminResponse cambiarRol(
            Long id,
            CambiarRolRequest solicitud,
            String correoOperador) {
        Usuario usuario = buscarUsuario(id);
        String nombreRol = solicitud.rol().trim().toUpperCase(Locale.ROOT);

        if (usuario.getCorreo().equalsIgnoreCase(correoOperador)
                && !nombreRol.equals("ADMIN")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No puedes quitarte tu propio rol ADMIN");
        }

        usuario.setRol(buscarRol(nombreRol));
        return convertir(usuarioRepository.save(usuario));
    }

    public UsuarioAdminResponse cambiarEstado(
            Long id,
            CambiarEstadoUsuarioRequest solicitud,
            String correoOperador) {
        Usuario usuario = buscarUsuario(id);

        if (usuario.getCorreo().equalsIgnoreCase(correoOperador)
                && !solicitud.activo()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No puedes desactivar tu propia cuenta");
        }

        usuario.setActivo(solicitud.activo());
        return convertir(usuarioRepository.save(usuario));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el usuario"));
    }

    private Rol buscarRol(String nombreRol) {
        return rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El rol indicado no existe"));
    }

    private UsuarioAdminResponse convertir(Usuario usuario) {
        return new UsuarioAdminResponse(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                usuario.isActivo());
    }
}