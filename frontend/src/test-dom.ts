import { GlobalRegistrator } from '@happy-dom/global-registrator'

// Precisa ser um módulo separado, importado antes do testing-library: o registrator instala
// `document`/`window` no globalThis e o react-dom lê esses globais no momento em que é avaliado.
// Fica fora do preload compartilhado (`test/setup.ts`) de propósito — o happy-dom também
// substitui `fetch`/`Headers`/`Response`, e o BetterAuth do back-end consome os nativos.
if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register({ url: 'http://localhost:5173' })
}
