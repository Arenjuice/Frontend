import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'
import { useSelector, useDispatch, Provider } from 'react-redux';
import store from './store.jsx'
import { setter, clear } from './tokenSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(setter(token)); // Inicializuokite Redux
      const checkToken = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
      
        // Patikrinkite galiojimą ar atnaujinkite token
        const response = await fetch('/api/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
      
        if (response.ok) {
          const data = await response.json();
          if (data?.newAccessToken) {
            localStorage.setItem('accessToken', data.newAccessToken); // Atnaujinkite token
            dispatch(setter(data.newAccessToken)); // Atnaujinkite Redux
          }
        } else {
          localStorage.removeItem('accessToken'); // Jei token nebegalioja
          dispatch(clear());
        }
      };
      
    } else {
      dispatch(clear());
    }
  }, [dispatch]);

  return (
    <Provider store={store}>
      <div>
        <header>
          <Header />
        </header>
        
        <main>
        </main>
        
        <footer>
          <Footer />
        </footer>
      </div>
    </Provider>
  );
}

export default App;
