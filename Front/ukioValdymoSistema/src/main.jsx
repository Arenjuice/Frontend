import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Fields from './components/Fields.jsx'
import Records from './components/Records.jsx'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store.jsx'
import Farms from './components/Farms.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        
        <Routes>
          <Route path="/fields/:id" element={<Fields />} />
          <Route path="/records/:idFarm/:idField" element={<Records />} />
          <Route path='/' element={<Home/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<SignUp/>} />
          <Route path='/farms' element={<Farms/>} />
        </Routes>
        <App />
      </BrowserRouter>
    
    </Provider>
  </StrictMode>,
)
