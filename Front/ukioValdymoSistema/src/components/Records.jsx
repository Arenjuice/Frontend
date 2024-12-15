import * as jwt_decode from 'jwt-decode';
import { jwtDecode } from "jwt-decode";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Card, Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import BackButton from './BackButton'; // Importuojame komponentą

function Records() {
    const { idFarm } = useParams();
    const { idField } = useParams();
    const location = useLocation();
    const field = location.state?.field;
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false); // Valdo modalų matomumą
    const [isEditing, setIsEditing] = useState(false); // Nustato redagavimo režimą
    const [editedRecord, setEditedRecord] = useState(null); // Saugo redaguojamą įrašą
    const [addRecordModalVisible, setAddRecordModalVisible] = useState(false); // Valdo naujo įrašo modalą
    const [newRecord, setNewRecord] = useState({ name: "", type: "", date: new Date().toISOString().split('T')[0], description: ""}); // Naujo įrašo duomenys
    const [selectedRecord, setSelectedRecord] = useState(null);  

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
    
        // API skambutis norint gauti įrašų informaciją
        fetch(`http://localhost:5145/api/Farms/${idFarm}/Fields/${idField}/Records`,{
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Nepavyko gauti įrašų informacijos");
            }
            return response.json();
          })
          .then((data) => {
            setRecords(data);
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
      }, [idFarm], [idField]);

      const handleCardClick = (idRecord) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
    
        // Paimame konkretaus ūkio duomenis
        fetch(`http://localhost:5145/api/Farms/${idFarm}/Fields/${idField}/Records/${idRecord}`, {
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
            setSelectedRecord(data);
            setEditedRecord(data);
            setModalVisible(true); // Atidaryti modalą tik jei užklausa sėkminga
          })
          .catch((err) => {
            console.error('Error fetching record details:', err);
          });
      };

      const handleCloseModal = () => {
        setModalVisible(false);
        setIsEditing(false)
        setSelectedRecord(null);
      };
    
      const handleAddRecord = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
    
        fetch(`http://localhost:5145/api/Farms/${idFarm}/Fields/${idField}/Records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newRecord),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((addedRecord) => {
            setRecords((prevRecords) => [...prevRecords, addedRecord]);
            setAddRecordModalVisible(false);
            setNewRecord({ name: "", type: "", date: new Date().toISOString().split('T')[0], description: ""});
          })
          .catch((err) => {
            console.error('Error adding record:', err);
          });
      };
    
      const handleSaveEdit = () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !editedRecord) return;
    
        fetch(`http://localhost:5145/api/Farms/${idFarm}/Fields/${idField}/Records/${editedRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(editedRecord),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((updatedRecord) => {
            setRecords((prevRecords) =>
              prevRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
            );
            setIsEditing(false);
            setModalVisible(false);
          })
          .catch((err) => {
            console.error('Error saving record:', err);
          });
      };
    
      const handleDelete = (idRecord) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
      
        fetch(`http://localhost:5145/api/Farms/${idFarm}/Fields/${idField}/Records/${idRecord}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // Atlaisviname modalą
            setModalVisible(false);
            setSelectedRecord(null);
      
            // Pašaliname ištrintą ūkį iš sąrašo
            setRecords((prevRecords) => prevRecords.filter((record) => record.id !== idRecord));
          })
          .catch((err) => {
            console.error('Error deleting record:', err);
          });
      };

  return (
    <>
    <BackButton to={`/fields/${idFarm}`} label="Grįžti į laukų sąrašą" />
    
    <Container className="mt-5 mb-5" >
        <h1>Laukas nr.: {field?.number}</h1>
        <p><strong>Pasėlių grupė:</strong> {field?.cropGroup}</p>
        <p><strong>Pasėlių grupės pavadinimas:</strong> {field?.cropGroupName}</p>
        <p><strong>Plotas:</strong> {field?.area}</p>

        <hr />
        <h2>Įrašai</h2>
        <Button variant="success" className="mb-4" onClick={() => setAddRecordModalVisible(true)}>
          Pridėti įrašą
        </Button>
        
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && records.length === 0 && (
            <Alert variant="warning">Pasirinktas laukas neturi priklausančių įrašų</Alert>
        )}

        {error ? (
                <p className="text-danger">{error}</p>
              ) : (
                <Row className="d-flex justify-content-center">
                {records.length == 1 ? (
                    <Col xs={12} md={12} lg={12} className="mb-4">
                      <Card onClick={() => handleCardClick(records[0].id)} style={{ cursor: 'pointer' }}>
                      <Card.Body>
                        <Card.Title>Įrašo pav.: {records[0].name}</Card.Title>
                        <Card.Text>
                          <strong>Tipas:</strong> {records[0].type}<br />
                        </Card.Text>
                      </Card.Body>
                      </Card>
                    </Col>
                  ) : (
                
                records.map((record, index) => (
                  <Col key={index} xs={12} md={8} lg={4} className="mb-4">
                    <Card onClick={() => handleCardClick(record.id)} style={{ cursor: 'pointer' }}>
                      <Card.Body>
                        <Card.Title>Įrašo pav.: {record.name}</Card.Title>
                        <Card.Text>
                          <strong>Tipas:</strong> {record.type}<br />
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                )))}
              </Row>
              )}

        {selectedRecord && (
            <Modal show={modalVisible} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                    {isEditing ? 'Redaguoti įrašą' : selectedRecord.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {isEditing ? (
                <Form>
                    <Form.Group className="mb-3">
                    <Form.Label>Įrašo pavadinimas</Form.Label>
                    <Form.Control
                    type="text"
                    value={editedRecord.name}
                    onChange={(e) =>
                      setEditedRecord({ ...editedRecord, name: e.target.value })
                    }
                    />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Tipas</Form.Label>
                        <Form.Control
                            type="text"
                            value={editedRecord.type}
                            onChange={(e) =>
                            setEditedRecord({ ...editedRecord, type: e.target.value })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Data</Form.Label>
                        <Form.Control
                            type="date"
                            value={editedRecord.date}
                            onChange={(e) =>
                            setEditedRecord({...editedRecord, date: e.target.value})
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Aprašymas</Form.Label>
                        <Form.Control
                            type="text"
                            value={editedRecord.description}
                            onChange={(e) =>
                            setEditedRecord({...editedRecord, description: e.target.value})
                            }
                        />
                    </Form.Group>
                </Form>
                ) : (
                <>
                <p>
                  <strong>Tipas:</strong> {selectedRecord.type}
                </p>
                <p>
                  <strong>Data:</strong> {selectedRecord.date}
                </p>
                <p>
                  <strong>Aprašymas:</strong> {selectedRecord.description}
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
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                        Redaguoti
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            if (window.confirm("Ar tikrai norite ištrinti šį įrašą?")) {
                            handleDelete(selectedRecord.id);
                            }
                        }}
                    >
                        Ištrinti
                    </Button>
                </>
                )}
                </Modal.Footer>
            </Modal>
        )}

        <Modal show={addRecordModalVisible} onHide={() => setAddRecordModalVisible(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Pridėti naują įrašą</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                    <Form.Label>Įrašo pavadinimas</Form.Label>
                    <Form.Control
                        type="text"
                        value={newRecord.name}
                        onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                    />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Tipas</Form.Label>
                        <Form.Select
                            value={newRecord.type}
                            onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                        >
                            <option value="">Pasirinkite tipą</option>
                            <option value="Darbas">Darbas</option>
                            <option value="Apžiūra">Apžiūra</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                    <Form.Label>Data</Form.Label>
                    <Form.Control
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    />
                    </Form.Group>
                    <Form.Group className="mb-3">
                    <Form.Label>Aprašymas</Form.Label>
                    <Form.Control
                        type="text"
                        value={newRecord.description}
                        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleAddRecord}>
                    Išsaugoti
                </Button>
                <Button variant="secondary" onClick={() => setAddRecordModalVisible(false)}>
                    Atšaukti
                </Button>
            </Modal.Footer>
        </Modal>
    </Container>
    </>
  );
}

export default Records;
