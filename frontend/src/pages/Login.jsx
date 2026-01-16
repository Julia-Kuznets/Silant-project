import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/token/', {
                username: username,
                password: password
            });

            const token = response.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);

            console.log("Токен получен:", token);

            navigate('/');

            window.location.reload();

        } catch (err) {
            console.error(err);
            setError('Неверный логин или пароль');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Card style={{ width: '25rem', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Card.Header className="text-center bg-primary text-white" style={{ backgroundColor: 'var(--color-blue)' }}>
                    <h4>Авторизация</h4>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Логин</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите логин"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {error && <Alert variant="danger">{error}</Alert>}

                        <div className="d-grid">
                            <Button type="submit" style={{ backgroundColor: 'var(--color-blue)', borderColor: 'var(--color-blue)' }}>
                                Войти
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;