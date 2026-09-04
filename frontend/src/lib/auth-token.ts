const STORAGE_KEY = 'financy.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // localStorage indisponível (modo privado, storage bloqueado) — sessão vira só-desta-aba.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ver setToken
  }
}
