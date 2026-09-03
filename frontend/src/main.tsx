import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fundação pendente — ver docs/tasks/005-frontend-foundation.md
function App() {
  return <p>Financy</p>
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
