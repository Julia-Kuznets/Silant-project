import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import api from '../api';

const CreateMaintenanceModal = ({ show, handleClose, machineId, onSuccess }) => {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [formData, setFormData] = useState({
        service_type: '',
        event_date: '',
        operating_hours: '',
        order_number: '',
        order_date: ''
    });
    const [error, setError] = useState('');

        useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await api.get('service_types/');

                const types = response.data.results || response.data;

                setServiceTypes(types);

                if (types.length > 0) {
                    setFormData(prev => ({...prev, service_type: types[0].name}));
                }
            } catch (err) {
                console.error("Не удалось загрузить справочник ТО");
            }
        };
        if (show) fetchTypes();
    }, [show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const currentUser = localStorage.getItem('username');

            const payload = {
                machine: machineId,

                service_type: formData.service_type,
                event_date: formData.event_date,
                operating_hours: formData.operating_hours,
                order_number: formData.order_number,
                order_date: formData.order_date,
                service_company: currentUser
            };

            await api.post('maintenances/', payload);

            onSuccess();
            handleClose();

            setFormData({
                service_type: serviceTypes[0]?.name || '',
                event_date: '',
                operating_hours: '',
                order_number: '',
                order_date: ''
            });

        } catch (err) {
            console.error(err);

            if (err.response && err.response.data) {
                const data = err.response.data;

                const errorValues = Object.values(data);

                const errorMessage = errorValues.flat().join('. ');

                setError(errorMessage);
            } else {
                setError('Не удалось сохранить данные. Проверьте соединение.');
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Добавить ТО</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>

                    <Form.Group className="mb-3">
                        <Form.Label>Вид ТО</Form.Label>
                        <Form.Select
                            name="service_type"
                            value={formData.service_type}
                            onChange={handleChange}
                        >
                            {serviceTypes.map(type => (
                                <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Дата проведения</Form.Label>
                        <Form.Control
                            type="date"
                            name="event_date"
                            value={formData.event_date}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Наработка (м/час)</Form.Label>
                        <Form.Control
                            type="number"
                            name="operating_hours"
                            value={formData.operating_hours}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>№ Заказ-наряда</Form.Label>
                        <Form.Control
                            type="text"
                            name="order_number"
                            value={formData.order_number}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Дата заказ-наряда</Form.Label>
                        <Form.Control
                            type="date"
                            name="order_date"
                            value={formData.order_date}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" className="me-2" onClick={handleClose}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Сохранить
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateMaintenanceModal;