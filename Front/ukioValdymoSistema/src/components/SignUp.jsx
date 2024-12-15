import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const navigate = useNavigate(); // Hook for navigation

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted');

        const payload = {
            userName: username,
            email: email,
            password: password,
        };

        console.log(payload);

        fetch('http://localhost:5145/api/accounts', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
            console.log('Response:', response);
            if (response.ok) {
                setShowModal(true); // Show success modal
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        })
        .catch((err) => {
            console.error('Error:', err);
            alert('Registracija nepavyko. Bandykite dar kartą.');
        });
    };

    const handleModalClose = () => {
        setShowModal(false);
        navigate('/login'); // Redirect to login page
    };

    return (
        <>
            <div>
                <h1>Registruokitės</h1>
            </div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Slapyvardis</Form.Label>
                    <Form.Control
                        required
                        type="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Įveskite slapyvardį"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>El. paštas</Form.Label>
                    <Form.Control
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Įveskite el. paštą"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Slaptažodis</Form.Label>
                    <Form.Control
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Įveskite slaptažodį"
                    />
                </Form.Group>

                <Button variant="success" type="submit">
                    Registruotis
                </Button>
            </Form>

            {/* Modal for successful registration */}
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Registracija sėkminga</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Jūsų registracija buvo sėkminga! Nukreipsime jus į prisijungimo puslapį.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleModalClose}>
                        Gerai
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SignUp;
