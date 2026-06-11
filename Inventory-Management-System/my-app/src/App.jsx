import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProductProvider } from "./context/ProductContext";
import Inventory from "./pages/owner/Inventory";
import Orders from "./pages/owner/Orders";
import Restock from "./pages/owner/Restock";
import Reports from "./pages/owner/Reports";
import Riders from "./pages/owner/Riders";
import './App.css'
import Landing from "./pages/Landing";
import Login from './pages/login';
import Register from "./pages/Register";
import Analytics from "./pages/owner/Analytics";
import RiderDashboard from "./pages/rider/Dashboard";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ProductProvider>
        <BrowserRouter>
          <Routes>

            <Route path="/owner/inventory" element={<Inventory />} />
            <Route path="/owner/orders" element={<Orders />} />
            <Route path="/owner/restock" element={<Restock />} />
            <Route path="/owner/reports" element={<Reports />} />
            <Route path="/owner/riders" element={<Riders />} />
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/owner/analytics" element={<Analytics />} />
            <Route path="/rider/dashboard" element={<RiderDashboard />} />

          </Routes>
        </BrowserRouter>
      </ProductProvider>
    </>
  )
}

export default App
