import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Card, Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton'; // Importuojame komponentą

function Fields() {
  const { id } = useParams(); // Ūkio ID iš URL
  const location = useLocation();
  const [farm, setFarm] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFarmer, setIsFarmer] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Valdo modalų matomumą
  const [isEditing, setIsEditing] = useState(false); // Nustato redagavimo režimą
  const [editedField, setEditedField] = useState(null); // Saugo redaguojamą lauką
  const [addFieldModalVisible, setAddFieldModalVisible] = useState(false); // Valdo naujo lauko modalą
  const [newField, setNewField] = useState({ number: "", cropGroup: "", cropGroupName: "", cropSubgroup: "", perimeter: "", area: "" }); // Naujo lauko duomenys
  const [selectedField, setSelectedField] = useState(null); 
  const navigate = useNavigate();
  

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
        const decodedToken = jwtDecode(token); // Dekoduoti tokeną
        const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];

        if (roles.includes('Farmer')) {
          setIsFarmer(true); // Patikrinti, ar yra Admin rolė
        }
      } catch (err) {
        console.error('Error decoding token:', err);
      }

    // API skambutis norint gauti laukų informaciją
    fetch(`http://localhost:5145/api/Farms/${id}/Fields`,{
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Nepavyko gauti laukų informacijos");
        }
        return response.json();
      })
      .then((data) => {
        setFields(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

      fetch(`http://localhost:5145/api/Farms/${id}`,{
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Nepavyko gauti laukų informacijos");
        }
        return response.json();
      })
      .then((data) => {
        setFarm(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleCardClick = (idField) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Paimame konkretaus ūkio duomenis
    fetch(`http://localhost:5145/api/Farms/${id}/Fields/${idField}`, {
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
        setSelectedField(data);
        setEditedField(data);
        setModalVisible(true); // Atidaryti modalą tik jei užklausa sėkminga
      })
      .catch((err) => {
        console.error('Error fetching field details:', err);
      });
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditing(false)
    setSelectedField(null);
  };

  const handleAddField = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`http://localhost:5145/api/Farms/${id}/Fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newField),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((addedField) => {
        setFields((prevFields) => [...prevFields, addedField]);
        setAddFieldModalVisible(false);
        setNewField({ number: "", cropGroup: "", cropGroupName: "", cropSubgroup: "", perimeter: "", area: "" });
      })
      .catch((err) => {
        console.error('Error adding field:', err);
      });
  };

  const handleSaveEdit = () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !editedField) return;

    fetch(`http://localhost:5145/api/Farms/${id}/Fields/${editedField.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(editedField),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((updatedField) => {
        setFields((prevFields) =>
          prevFields.map((field) => (field.id === updatedField.id ? updatedField : field))
        );
        setIsEditing(false);
        setModalVisible(false);
      })
      .catch((err) => {
        console.error('Error saving field:', err);
      });
  };

  const handleDelete = (idField) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
  
    fetch(`http://localhost:5145/api/Farms/${id}/Fields/${idField}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Atlaisviname modalą
        setModalVisible(false);
        setSelectedField(null);
  
        // Pašaliname ištrintą ūkį iš sąrašo
        setFields((prevFields) => prevFields.filter((field) => field.id !== idField));
      })
      .catch((err) => {
        console.error('Error deleting field:', err);
      });
  };

  return (
    <>
    {/* "Grįžti atgal" mygtukas */}
    <BackButton to="/farms" label="Grįžti į ūkių sąrašą" />

      
    <Container className="mt-5 mb-5">
      <h1>Ūkis: {farm?.name}</h1>
      <p><strong>Registracijos numeris:</strong> {farm?.holdingNumber}</p>
      <p><strong>Tipas:</strong> {farm?.type}</p>
      <p><strong>Įkūrimo metai:</strong> {farm?.yearOfFoundation}</p>
      
      <hr />
      <h2>Laukai</h2>
    
      {isFarmer && (
        <Button variant="success" className="mb-4" onClick={() => setAddFieldModalVisible(true)}>
          Pridėti lauką
        </Button>
      )}
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && fields.length === 0 && (
        <Alert variant="warning">Pasirinktas ūkis neturi priklausančių laukų</Alert>
      )}

      {error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <Row className="d-flex justify-content-center">
          {fields.length == 1 ? (
            <Col xs={12} md={6} lg={12} className="mb-4">
              <Card onClick={() => handleCardClick(fields[0].id)} style={{ cursor: 'pointer' }}>
                <Card.Body>
                  <Card.Title>Lauko Nr. {fields[0].number}</Card.Title>
                  <Card.Text>
                    <strong>Pasėlių grupė:</strong> {fields[0].cropGroup}<br />
                    <strong>Pasėlių grupės pavadinimas:</strong> {fields[0].cropGroupName}<br />
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            fields.map((field, index) => (
              <Col key={index} xs={12} md={6} lg={4} className="mb-4">
                <Card onClick={() => handleCardClick(field.id)} style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <Card.Title>Lauko Nr. {field.number}</Card.Title>
                    <Card.Text>
                      <strong>Pasėlių grupė:</strong> {field.cropGroup}<br />
                      <strong>Pasėlių grupės pavadinimas:</strong> {field.cropGroupName}<br />
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}


      {/* Modal komponentas */}
      {selectedField && (
      <Modal show={modalVisible} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Redaguoti lauką' : selectedField.number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {isEditing ? (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Lauko numeris</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedField.number}
                    onChange={(e) =>
                      setEditedField({ ...editedField, number: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Pasėlių grupė</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedField.cropGroup}
                    onChange={(e) =>
                      setEditedField({ ...editedField, cropGroup: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Pasėlio grupės pavadinimas</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedField.cropGroupName}
                    onChange={(e) =>
                      setEditedField({ ...editedField, cropGroupName: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Pasėlio pogrupis</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedField.cropSubgroup}
                    onChange={(e) =>
                      setEditedField({ ...editedField, cropSubgroup: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Perimetras</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedField.perimeter}
                    onChange={(e) =>
                      setEditedField({...editedField, perimeter: e.target.value})
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Plotas</Form.Label>
                  <Form.Control
                    type="text"
                    value={editedField.area}
                    onChange={(e) =>
                      setEditedField({...editedField, area: e.target.value})
                    }
                  />
                </Form.Group>
              </Form>
            ) : (
              <>
                <p>
                  <strong>Pasėlių grupė:</strong>{' '}
                  {selectedField.cropGroup}
                </p>
                <p>
                  <strong>Pasėlio grupės pavadinimas:</strong> {selectedField.cropGroupName}
                </p>
                <p>
                  <strong>Pasėlio pogrupis:</strong> {selectedField.cropSubgroup}
                </p>
                <p>
                  <strong>Perimetras:</strong> {selectedField.perimeter}
                </p>
                <p>
                  <strong>Plotas:</strong> {selectedField.area}
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
                        if (window.confirm("Ar tikrai norite ištrinti šį lauką?")) {
                          handleDelete(selectedField.id);
                        }
                      }}
                    >
                      Ištrinti
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="success" 
                  onClick={() => navigate(`/records/${id}/${selectedField.id}`, { state: { field: selectedField } })}
                >
                  Peržiūrėti lauko įrašus
                </Button>
              </>
            )}
        </Modal.Footer>
      </Modal>
    )}        

    <Modal show={addFieldModalVisible} onHide={() => setAddFieldModalVisible(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pridėti naują lauką</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
            <Form.Label>Lauko numeris</Form.Label>
              <Form.Control
                type="text"
                value={newField.number}
                onChange={(e) => setNewField({ ...newField, number: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pasėlių grupė</Form.Label>
              <Form.Control
                type="text"
                value={newField.cropGroup}
                onChange={(e) => setNewField({ ...newField, cropGroup: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pasėlio grupės pavadinimas</Form.Label>
              <Form.Control
                type="text"
                value={newField.cropGroupName}
                onChange={(e) => setNewField({ ...newField, cropGroupName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pasėlio pogrupis</Form.Label>
              <Form.Control
                type="text"
                value={newField.cropSubgroup}
                onChange={(e) => setNewField({ ...newField, cropSubgroup: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Perimetras</Form.Label>
              <Form.Control
                type="text"
                value={newField.perimeter}
                onChange={(e) => setNewField({ ...newField, perimeter: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Plotas</Form.Label>
              <Form.Control
                type="text"
                value={newField.area}
                onChange={(e) => setNewField({ ...newField, area: Number(e.target.value) })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleAddField}>
            Išsaugoti
          </Button>
          <Button variant="secondary" onClick={() => setAddFieldModalVisible(false)}>
            Atšaukti
          </Button>
        </Modal.Footer>
      </Modal>
      
    </Container>
    </>
  );
}

export default Fields;
