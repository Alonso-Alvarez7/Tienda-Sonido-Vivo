package cl.tienda.sonidoVivo.Api.common;

/** Formato único de respuesta JSON de la API: { ok, data, mensaje }. */
public record ApiResponse<T>(boolean ok, T data, String mensaje) {

    public static <T> ApiResponse<T> exito(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> exito(T data, String mensaje) {
        return new ApiResponse<>(true, data, mensaje);
    }

    public static <T> ApiResponse<T> error(String mensaje) {
        return new ApiResponse<>(false, null, mensaje);
    }
}