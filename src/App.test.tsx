import { describe, expect, test } from 'vitest'

// Minimal smoke test - App uses TanStack Router so we just verify module loads
describe('App module', () => {
  test('module exports a default component', async () => {
    const mod = await import('./App.tsx')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })
})
