import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { useSelector, useDispatch } from 'react-redux';
import {setter} from '../tokenSlice'

const Login = () => {
    const accessToken = useSelector((state) => state.token.value)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('form submitted')

        const payload = {
            userName: username,
            password: password 
        }

        fetch('http://localhost:5145/api/login', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(json => {
            console.log('Response JSON:', json);
            if (json?.accessToken) {
                localStorage.setItem('accessToken', json.accessToken);
                dispatch(setter(json.accessToken)); // Save token in Redux
                navigate('/'); // Redirect to home
              } else {
                alert('Prisijungimas nepavyko. Patikrinkite duomenis.');
              }
        })
        .catch(err => {
            console.error('Error:', err);
        });
        
    }
    return(
        <>
        <div>
            <h1>Prisijunkite </h1>
        </div>
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Slapyvardis</Form.Label>
                <Form.Control required type="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Įveskite slapyvardį" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Slaptažodis</Form.Label>
                <Form.Control required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Įveskite slaptažodį" />
            </Form.Group>

            <Button variant="success" type="submit">
                Prisijungti
            </Button>
        </Form>
        </>
    )
}

export default Login