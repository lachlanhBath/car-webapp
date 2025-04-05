import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ApiProvider } from './services/ApiContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <ApiProvider>
        <App />
      </ApiProvider>
    </Router>
  </React.StrictMode>,
)
