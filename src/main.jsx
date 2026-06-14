import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import useHideMobileBrowserBar from './hooks/useHideMobileBrowserBar.js'

function Root() {
  useHideMobileBrowserBar()
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
