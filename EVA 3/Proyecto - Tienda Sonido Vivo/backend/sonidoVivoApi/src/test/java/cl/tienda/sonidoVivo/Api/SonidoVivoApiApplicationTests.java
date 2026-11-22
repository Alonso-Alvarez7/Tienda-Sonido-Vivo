package cl.tienda.sonidoVivo.Api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Perfil "test": no activa "mysql", así los tests usan H2 en memoria y no dependen de XAMPP.
@SpringBootTest(properties = "spring.profiles.active=test")
class SonidoVivoApiApplicationTests {

	@Test
	void contextLoads() {
	}

}