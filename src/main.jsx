import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'  // Updated path to point to the styles folder
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)