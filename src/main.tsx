import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useAuthStore } from './stores/authStore'

// Initialize auth on app start
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { initialize } = useAuthStore()

    useEffect(() => {
        initialize()
    }, [initialize])

    return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthInitializer>
            <App />
        </AuthInitializer>
    </React.StrictMode>,
)
