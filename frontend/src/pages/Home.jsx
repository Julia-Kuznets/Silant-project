import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Table, Row, Col } from 'react-bootstrap';

const Home = () => {
    const [serialNumber, setSerialNumber] = useState('');
    const [machineData, setMachineData] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setMachineData(null);

        if (!serialNumber) {
            setError('Пожалуйста, введите заводской номер');
            return;
        }

        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/machines/search/?serial_number=${serialNumber}`);
            setMachineData(response.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError('Машина с таким номером не найдена');
            } else {
                setError('Ошибка соединения с сервером');
            }
        }
    };

    return (
        <Container>
            <h2 className="text-center mb-4">Проверьте комплектацию и технические характеристики техники Силант</h2>

            {/* Форма поиска */}
            <Row className="justify-content-center mb-5">
                <Col md={6}>
                    <Form onSubmit={handleSearch} className="d-flex gap-2">
                        <Form.Control
                            type="text"
                            placeholder="Введите заводской номер"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                        />
                        <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--color-blue)' }}>
                            Поиск
                        </Button>
                    </Form>
                </Col>
            </Row>

            {/* Блок ошибки */}
            {error && (
                <Alert variant="danger" className="text-center">
                    {error}
                </Alert>
            )}

            {/* Таблица с результатами */}
            {machineData && (
                <div className="mt-4">
                    <h4 className="mb-3">Результат поиска:</h4>
                    <p className="text-muted">Информация о комплектации и технических характеристиках Вашей техники</p>

                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Характеристика</th>
                                <th>Значение</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Заводской номер</td><td>{machineData.serial_number}</td></tr>
                            <tr><td>Модель техники</td><td>{machineData.technique_model}</td></tr>
                            <tr><td>Модель двигателя</td><td>{machineData.engine_model}</td></tr>
                            <tr><td>Зав. № двигателя</td><td>{machineData.engine_number}</td></tr>
                            <tr><td>Модель трансмиссии</td><td>{machineData.transmission_model}</td></tr>
                            <tr><td>Зав. № трансмиссии</td><td>{machineData.transmission_number}</td></tr>
                            <tr><td>Модель ведущего моста</td><td>{machineData.drive_axle_model}</td></tr>
                            <tr><td>Зав. № ведущего моста</td><td>{machineData.drive_axle_number}</td></tr>
                            <tr><td>Модель управляемого моста</td><td>{machineData.steering_axle_model}</td></tr>
                            <tr><td>Зав. № управляемого моста</td><td>{machineData.steering_axle_number}</td></tr>
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default Home;