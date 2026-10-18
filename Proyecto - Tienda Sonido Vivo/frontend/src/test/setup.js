import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * Preparación común para todas las pruebas.
 * Cada test comienza con localStorage vacío (sin sesión ni datos previos).
 * Al terminar, se desmontan los componentes renderizados.
 */
beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})