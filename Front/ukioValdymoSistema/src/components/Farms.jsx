import { useEffect, useState } from 'react';
import * as jwt_decode from 'jwt-decode';
import { jwtDecode } from "jwt-decode";
//import { decode } from 'jwt-decode';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Lottie from "lottie-react";
import animationData from '../assets/Animation - 1734265248541.json';

function Farms() {
  const [farms, setFarms] = useState([]); // Saugo ūkių sąrašą
  const [selectedFarm, setSelectedFarm] = useState(null); // Saugo pasirinktą ūkį
  const [error, setError] = useState(null); // Saugo klaidos informaciją
  const [modalVisible, setModalVisible] = useState(false); // Valdo modalų matomumą
  const [isFarmer, setIsFarmer] = useState(false); // Patikrina, ar naudotojas turi administratoriaus rolę
  const [isEditing, setIsEditing] = useState(false); // Nustato redagavimo režimą
  const [editedFarm, setEditedFarm] = useState(null); // Saugo redaguojamą ūkį
  const [addFarmModalVisible, setAddFarmModalVisible] = useState(false); // Valdo naujo ūkio modalą
  const [newFarm, setNewFarm] = useState({ name: "", holdingNumber: "", yearOfFoundation: 0, type: "" }); // Naujo ūkio duomenys
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);  // Pradinis įkrovimo būsena 

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Išskleisti roles iš token
    try {
      const decodedToken = jwtDecode(token); // Dekoduoti tokeną
      const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
      
      if (roles.includes('Farmer')) {
        setIsFarmer(true); // Patikrinti, ar yra Admin rolė
      }
    } catch (err) {
      console.error('Error decoding token:', err);
    }

    // Paimame ūkių duomenis
    fetch('http://localhost:5145/api/Farms', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setFarms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching farms:', err);
        setError('Nepavyko užkrauti ūkių informacijos. Bandykite dar kartą.');
        setLoading(false);
      });
  }, []);

  const handleSaveEdit = () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !editedFarm) return;

    fetch(`http://localhost:5145/api/Farms/${editedFarm.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(editedFarm),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((updatedFarm) => {
        setFarms((prevFarms) =>
          prevFarms.map((farm) => (farm.id === updatedFarm.id ? updatedFarm : farm))
        );
        setIsEditing(false);
        setModalVisible(false);
      })
      .catch((err) => {
        console.error('Error saving farm:', err);
      });
  };


  // Funkcija pasirinktai kortelei paspausti
  const handleCardClick = (id) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Paimame konkretaus ūkio duomenis
    fetch(`http://localhost:5145/api/Farms/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setSelectedFarm(data);
        setEditedFarm(data);
        setModalVisible(true); // Atidaryti modalą tik jei užklausa sėkminga
      })
      .catch((err) => {
        console.error('Error fetching farm details:', err);
      });
  };

  // Modal uždarymo funkcija
  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditing(false)
    setSelectedFarm(null);
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
  
    fetch(`http://localhost:5145/api/Farms/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Atlaisviname modalą
        setModalVisible(false);
        setSelectedFarm(null);
  
        // Pašaliname ištrintą ūkį iš sąrašo
        setFarms((prevFarms) => prevFarms.filter((farm) => farm.id !== id));
      })
      .catch((err) => {
        console.error('Error deleting farm:', err);
      });
  };
  
  const handleAddFarm = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch('http://localhost:5145/api/Farms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newFarm),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((addedFarm) => {
        setFarms((prevFarms) => [...prevFarms, addedFarm]);
        setAddFarmModalVisible(false);
        setNewFarm({ name: "", holdingNumber: "", yearOfFoundation: 0, type: "" });
      })
      .catch((err) => {
        console.error('Error adding farm:', err);
      });
  };


  return (
    <Container className="mt-5 mb-5">
      <h1 className="mb-4">Ūkių sąrašas</h1>

      {/* Rodyti "Pridėti ūkį" mygtuką, jei naudotojas turi administratoriaus rolę */}
      {isFarmer && (
        <Button variant="success" className="mb-4" onClick={() => setAddFarmModalVisible(true)}>
          Pridėti ūkį
        </Button>
      )}
      {error && (
        <p className="text-danger">{error}</p>
      )}

      {loading ? (
        <div style={{position: 'relative', width: '100%'
        }}>
          <Lottie 
            animationData={animationData} 
            style={{ position: 'absolute', right: '10%', maxWidth: '75%', height: 'auto' 
            }} 
          />
        </div>
      ) : (
        <Row>
          {farms.map((farm) => (
            <Col key={farm.id} xs={12} md={6} lg={4} className="mb-4">
              <Card onClick={() => handleCardClick(farm.id)} style={{ cursor: 'pointer' }}>
                <Card.Body>
                  <Card.Title>{farm.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{farm.type}</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}


      {/* Modal komponentas */}
      {selectedFarm && (
      <Modal show={modalVisible} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Redaguoti ūkį' : selectedFarm.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {isEditing ? (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Pavadinimas</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedFarm.name}
                    onChange={(e) =>
                      setEditedFarm({ ...editedFarm, name: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Tipas</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedFarm.type}
                    onChange={(e) =>
                      setEditedFarm({ ...editedFarm, type: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Registracijos numeris</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedFarm.holdingNumber}
                    onChange={(e) =>
                      setEditedFarm({ ...editedFarm, holdingNumber: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Įkūrimo metai </Form.Label>
                  <DatePicker
                    selected={new Date(editedFarm.yearOfFoundation || new Date().getFullYear(), 0)}
                    onChange={(date) =>
                      setEditedFarm({
                        ...editedFarm,
                        yearOfFoundation: date.getFullYear(),
                      })
                    }
                    showYearPicker
                    dateFormat="yyyy"
                    className="form-control"
                    minDate={new Date(1900, 0)} // Minimalus metai
                    maxDate={new Date()}       // Dabartiniai metai
                    yearItemNumber={12}        // Rodo daugiau metų peržiūrai
                  />
                </Form.Group>
              </Form>
            ) : (
              <>
                <p>
                  <strong>Tipas:</strong> {selectedFarm.type}
                </p>
                <p>
                  <strong>Registracijos numeris:</strong>{' '}
                  {selectedFarm.holdingNumber}
                </p>
                <p>
                  <strong>Įkūrimo metai:</strong> {selectedFarm.yearOfFoundation}
                </p>
              </>
            )}
        </Modal.Body>
        <Modal.Footer>        
          {isEditing ? (
              <>
                <Button variant="success" onClick={handleSaveEdit}>
                  Išsaugoti
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Atšaukti
                </Button>
              </>
            ) : (
              <>
              {isFarmer && (
                  <>
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                        Redaguoti
                      </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (window.confirm("Ar tikrai norite ištrinti šį ūkį?")) {
                          handleDelete(selectedFarm.id);
                        }
                      }}
                    >
                      Ištrinti
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="success" 
                  onClick={() => navigate(`/fields/${selectedFarm.id}`, { state: { farm: selectedFarm } })}
                >
                  Peržiūrėti laukus
                </Button>
              </>
            )}
        </Modal.Footer>
      </Modal>
    )}

    {/* Naujo ūkio modalas */}
    <Modal show={addFarmModalVisible} onHide={() => setAddFarmModalVisible(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pridėti naują ūkį</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Pavadinimas</Form.Label>
              <Form.Control
                type="text"
                value={newFarm.name}
                onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipas</Form.Label>
              <Form.Control
                type="text"
                value={newFarm.type}
                onChange={(e) => setNewFarm({ ...newFarm, type: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Registracijos numeris</Form.Label>
              <Form.Control
                type="text"
                value={newFarm.holdingNumber}
                onChange={(e) => setNewFarm({ ...newFarm, holdingNumber: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="mb-2">Įkūrimo metai </Form.Label>
              <DatePicker
                selected={new Date(newFarm.yearOfFoundation || new Date().getFullYear(), 0)}
                onChange={(date) =>
                  setNewFarm({ ...newFarm, yearOfFoundation: date.getFullYear() })
                }
                showYearPicker
                dateFormat="yyyy"
                className="form-control"
                minDate={new Date(1900, 0)} 
                maxDate={new Date()}      
                yearItemNumber={12}        
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleAddFarm}>
            Išsaugoti
          </Button>
          <Button variant="secondary" onClick={() => setAddFarmModalVisible(false)}>
            Atšaukti
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default Farms;
