import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import api from '../api';

const CreateComplaintModal = ({ show, handleClose, machineId, onSuccess }) => {
    // Справочники
    const [failureNodes, setFailureNodes] = useState([]);
    const [recoveryMethods, setRecoveryMethods] = useState([]);

    // Форма
    const [formData, setFormData] = useState({
        failure_date: '',
        operating_hours: '',
        failure_node: '',
        failure_description: '',
        recovery_method: '',
        spare_parts_used: '',
        restoration_date: ''
    });
    const [error, setError] = useState('');

    // Загрузка справочников
    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const [nodesRes, methodsRes] = await Promise.all([
                    api.get('failure_nodes/'),
                    api.get('recovery_methods/')
                ]);

                const nodes = nodesRes.data.results || nodesRes.data;
                const methods = methodsRes.data.results || methodsRes.data;

                setFailureNodes(nodes);
                setRecoveryMethods(methods);

                setFormData(prev => ({
                    ...prev,
                    failure_node: nodes[0]?.name || '',
                    recovery_method: methods[0]?.name || ''
                }));
            } catch (err) {
                console.error("Ошибка загрузки справочников");
            }
        };
        if (show) fetchCatalogs();
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
                service_company: currentUser,
                ...formData
            };

            await api.post('complaints/', payload);

            onSuccess();
            handleClose();
            setFormData(prev => ({
                ...prev,
                failure_date: '',
                operating_hours: '',
                failure_description: '',
                spare_parts_used: '',
                restoration_date: ''
            }));

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const errorValues = Object.values(err.response.data);
                setError(errorValues.flat().join('. '));
            } else {
                setError('Не удалось сохранить данные.');
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Добавить рекламацию</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>

                    <Form.Group className="mb-3">
                        <Form.Label>Дата отказа</Form.Label>
                        <Form.Control type="date" name="failure_date" value={formData.failure_date} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Наработка (м/час)</Form.Label>
                        <Form.Control type="number" name="operating_hours" value={formData.operating_hours} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Узел отказа</Form.Label>
                        <Form.Select name="failure_node" value={formData.failure_node} onChange={handleChange}>
                            {failureNodes.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Описание отказа</Form.Label>
                        <Form.Control as="textarea" rows={3} name="failure_description" value={formData.failure_description} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Способ восстановления</Form.Label>
                        <Form.Select name="recovery_method" value={formData.recovery_method} onChange={handleChange}>
                            {recoveryMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Используемые запчасти</Form.Label>
                        <Form.Control as="textarea" rows={2} name="spare_parts_used" value={formData.spare_parts_used} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Дата восстановления</Form.Label>
                        <Form.Control type="date" name="restoration_date" value={formData.restoration_date} onChange={handleChange} required />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" className="me-2" onClick={handleClose}>Отмена</Button>
                        <Button variant="primary" type="submit">Сохранить</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateComplaintModal;