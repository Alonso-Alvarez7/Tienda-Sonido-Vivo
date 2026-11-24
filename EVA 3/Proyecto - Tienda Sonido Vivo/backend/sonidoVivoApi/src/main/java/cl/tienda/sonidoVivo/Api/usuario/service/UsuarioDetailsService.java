package cl.tienda.sonidoVivo.Api.usuario.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.tienda.sonidoVivo.Api.usuario.model.Usuario;
import cl.tienda.sonidoVivo.Api.usuario.repository.UsuarioRepository;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo.trim().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Correo o contraseña incorrectos"));

        return User.withUsername(usuario.getCorreo())
                .password(usuario.getPasswordHash())
                .roles(usuario.getRol().getNombre())
                .disabled(!usuario.isActivo())
                .build();
    }
}