import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { CartProvider } from './contexts/CartContext'
import { AddressProvider } from './contexts/AddressContext'
import { RiderProvider } from './contexts/RiderContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <AddressProvider>
            <RiderProvider>
              <App />
            </RiderProvider>
          </AddressProvider>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  </StrictMode>,
)
