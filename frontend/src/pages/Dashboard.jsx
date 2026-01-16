import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Form, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Пагинация и счетчик
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [count, setCount] = useState(0);

    // Начальное состояние фильтров
    const initialFilters = {
        technique_model__name__icontains: '',
        engine_model__name__icontains: '',
        transmission_model__name__icontains: '',
        drive_axle_model__name__icontains: '',
        steering_axle_model__name__icontains: ''
    };

    const [filters, setFilters] = useState(initialFilters);

    // === СТЕЙТ ДЛЯ СОРТИРОВКИ ===
    const [ordering, setOrdering] = useState('');

    // Функция загрузки данных
    const fetchMachines = async (url = 'machines/', customFilters = null, customOrdering = null) => {
        setLoading(true);
        setError('');
        try {
            const isFullUrl = url.includes('http');
            const paramsToSend = customFilters || filters;

            const currentOrdering = customOrdering !== null ? customOrdering : ordering;

            const config = isFullUrl ? {} : {
                params: {
                    ...paramsToSend,
                    ordering: currentOrdering
                }
            };

            const response = await api.get(url, config);

            setMachines(response.data.results);
            setNextPage(response.data.next);
            setPrevPage(response.data.previous);
            setCount(response.data.count);

        } catch (err) {
            console.error(err);
            setError('Ошибка загрузки данных.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
    }, [ordering]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();
        fetchMachines('machines/');
    };

    // ФУНКЦИЯ СБРОСА
    const handleResetFilters = () => {
        setFilters(initialFilters);
        setOrdering('');
        fetchMachines('machines/', initialFilters, '');
    };

     // ФУНКЦИЯ ОБРАБОТКИ КЛИКА ПО ЗАГОЛОВКУ ===
    const handleSort = (field) => {
        if (ordering === field) {
            setOrdering(`-${field}`);
        } else {
            setOrdering(field);
        }
    };

    const renderSortIcon = (field) => {
        if (ordering === field) {
            return <span style={{ color: 'var(--color-blue)', fontWeight: 'bold' }}> ▲</span>;
        }
        if (ordering === `-${field}`) {
            return <span style={{ color: 'var(--color-blue)', fontWeight: 'bold' }}> ▼</span>;
        }

        return <span style={{ color: '#ccc', fontSize: '0.8em' }}> ⇅</span>;
    };

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Ваша техника (Всего: {count})</h2>
            </div>

            <Form className="mb-4 p-3 bg-light border rounded" onSubmit={handleApplyFilters}>
                <h6 className="text-muted mb-3">Фильтрация</h6>
                <Row>
                    <Col md={4} className="mb-2">
                        <Form.Control
                            name="technique_model__name__icontains"
                            type="text"
                            placeholder="Модель техники"
                            value={filters.technique_model__name__icontains}
                            onChange={handleFilterChange}
                        />
                    </Col>
                    <Col md={4} className="mb-2">
                        <Form.Control
                            name="engine_model__name__icontains"
                            type="text"
                            placeholder="Модель двигателя"
                            value={filters.engine_model__name__icontains}
                            onChange={handleFilterChange}
                        />
                    </Col>
                    <Col md={4} className="mb-2">
                        <Form.Control
                            name="transmission_model__name__icontains"
                            type="text"
                            placeholder="Модель трансмиссии"
                            value={filters.transmission_model__name__icontains}
                            onChange={handleFilterChange}
                        />
                    </Col>
                    <Col md={4} className="mb-2">
                        <Form.Control
                            name="drive_axle_model__name__icontains"
                            type="text"
                            placeholder="Модель вед. моста"
                            value={filters.drive_axle_model__name__icontains}
                            onChange={handleFilterChange}
                        />
                    </Col>
                    <Col md={4} className="mb-2">
                        <Form.Control
                            name="steering_axle_model__name__icontains"
                            type="text"
                            placeholder="Модель упр. моста"
                            value={filters.steering_axle_model__name__icontains}
                            onChange={handleFilterChange}
                        />
                    </Col>
                    <Col md={4} className="mb-2 d-flex gap-2">
                         <Button type="submit" variant="primary" className="w-100" style={{ backgroundColor: 'var(--color-blue)' }}>Искать</Button>
                         <Button type="button" variant="outline-secondary" onClick={handleResetFilters}>Сброс</Button>
                    </Col>
                </Row>
            </Form>

            {loading ? (
                <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /></Container>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : machines.length === 0 ? (
                <Alert variant="info">Техника не найдена.</Alert>
            ) : (
                <>
                    <Table striped bordered hover responsive className="align-middle">
                        <thead className="text-white" style={{ backgroundColor: 'var(--color-blue)' }}>
                            <tr>
                                {/* 1. Зав. № машины */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('serial_number')}
                                >
                                    Зав. № машины {renderSortIcon('serial_number')}
                                </th>

                                {/* 2. Модель техники */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('technique_model__name')}
                                >
                                    Модель техники {renderSortIcon('technique_model__name')}
                                </th>

                                {/* 3. Модель двигателя */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('engine_model__name')}
                                >
                                    Модель двигателя {renderSortIcon('engine_model__name')}
                                </th>

                                {/* 4. Зав. № двигателя */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('engine_number')}
                                >
                                    Зав. № двигателя {renderSortIcon('engine_number')}
                                </th>

                                {/* 5. Модель трансмиссии */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('transmission_model__name')}
                                >
                                    Модель трансмиссии {renderSortIcon('transmission_model__name')}
                                </th>

                                {/* 6. Зав. № трансмиссии */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('transmission_number')}
                                >
                                    Зав. № трансмиссии {renderSortIcon('transmission_number')}
                                </th>

                                {/* 7. Модель вед. моста */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('drive_axle_model__name')}
                                >
                                    Модель вед. моста {renderSortIcon('drive_axle_model__name')}
                                </th>

                                {/* 8. Модель упр. моста */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('steering_axle_model__name')}
                                >
                                    Модель упр. моста {renderSortIcon('steering_axle_model__name')}
                                </th>

                                {/* 9. Дата отгрузки */}
                                <th
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSort('shipment_date')}
                                >
                                    Дата отгрузки {renderSortIcon('shipment_date')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {machines.map((machine) => (
                                <tr
                                    key={machine.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/machine/${machine.id}`)}
                                >
                                    <td className="fw-bold text-primary">{machine.serial_number}</td>
                                    <td>{machine.technique_model}</td>
                                    <td>{machine.engine_model}</td>
                                    <td>{machine.engine_number}</td>
                                    <td>{machine.transmission_model}</td>
                                    <td>{machine.transmission_number}</td>
                                    <td>{machine.drive_axle_model}</td>
                                    <td>{machine.steering_axle_model}</td>
                                    <td>{machine.shipment_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-center mt-3">
                        <Button
                            variant="outline-primary"
                            className="me-2"
                            disabled={!prevPage}
                            onClick={() => fetchMachines(prevPage)}
                        >
                            &larr; Назад
                        </Button>
                        <span className="align-self-center text-muted">Страницы листаются сервером</span>
                        <Button
                            variant="outline-primary"
                            className="ms-2"
                            disabled={!nextPage}
                            onClick={() => fetchMachines(nextPage)}
                        >
                            Вперед &rarr;
                        </Button>
                    </div>
                </>
            )}
        </Container>
    );
};

export default Dashboard;