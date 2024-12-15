import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { setter } from '../tokenSlice';
import store from '../store.jsx';
import { useNavigate } from 'react-router-dom';
import { clear } from '../tokenSlice';

function Header() {
  const accessToken = useSelector((state) => state.token.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      /*
      const response = await fetch('http://localhost:5145/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'}
      });

      if (response.ok) {*/
        localStorage.removeItem('accessToken'); // Pašalinkite iš localStorage
        dispatch(clear()); // Išvalykite Redux būseną
        navigate('/login');// Perkeliame naudotoją į pradinį puslapį
      /*} else {
        console.error('Logout failed:', response.status);
      }*/
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <Provider store={store}>
    <>
    
      <Navbar bg="success" expand="lg" data-bs-theme="dark" className="fixed-top">
        <Container>
          <Navbar.Brand href="/">
            <img
              alt=""
              src="/grain.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Ūkio valdymo sistema
          </Navbar.Brand>
          {/* Toggle button for small screens */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto"> {/* `ms-auto` for right alignment */}
              {accessToken ? (
                <>
                  <Nav.Link href="/farms">Ūkių sąrašas</Nav.Link>
                  <Nav.Link onClick={handleLogout}>Atsijungti</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link href="/login">Prisijungti</Nav.Link>
                  <Nav.Link href="/register">Registruotis</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
    </>
    </Provider>
  );
}

export default Header;
