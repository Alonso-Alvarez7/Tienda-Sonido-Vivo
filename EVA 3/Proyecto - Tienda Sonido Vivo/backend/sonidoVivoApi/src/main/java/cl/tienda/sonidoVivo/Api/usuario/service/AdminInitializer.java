package cl.tienda.sonidoVivo.Api.usuario.service;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import cl.tienda.sonidoVivo.Api.usuario.model.Rol;
import cl.tienda.sonidoVivo.Api.usuario.model.Usuario;
import cl.tienda.sonidoVivo.Api.usuario.repository.RolRepository;
import cl.tienda.sonidoVivo.Api.usuario.repository.UsuarioRepository;

@Component
@Profile("!test")
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(AdminInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.nombre:Administrador}")
    private String nombreAdmin;

    @Value("${app.admin.correo:}")
    private String correoAdmin;

    @Value("${app.admin.clave:}")
    private String claveAdmin;

    public AdminInitializer(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (correoAdmin.isBlank() || claveAdmin.isBlank()) {
            log.info("Administrador inicial omitido: configura ADMIN_EMAIL y ADMIN_PASSWORD.");
            return;
        }

        if (claveAdmin.length() < 8) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD debe tener al menos 8 caracteres.");
        }

        String correoNormalizado =
                correoAdmin.trim().toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByCorreo(correoNormalizado)) {
            log.info("El usuario administrador inicial ya existe; no se modificó.");
            return;
        }

        Rol rolAdmin = rolRepository.findByNombre("ADMIN")
                .orElseThrow(() -> new IllegalStateException(
                        "No existe el rol ADMIN. Ejecuta primero el script de usuarios."));

        Usuario admin = new Usuario();
        admin.setNombreCompleto(nombreAdmin.trim());
        admin.setCorreo(correoNormalizado);
        admin.setPasswordHash(passwordEncoder.encode(claveAdmin));
        admin.setActivo(true);
        admin.setRol(rolAdmin);

        usuarioRepository.save(admin);
        log.info("Administrador inicial creado.");
    }
}