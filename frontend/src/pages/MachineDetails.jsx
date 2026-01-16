import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Table, Spinner, Alert, Tabs, Tab, Button } from 'react-bootstrap';
import api from '../api';
import CreateMaintenanceModal from '../components/CreateMaintenanceModal';
import CreateComplaintModal from '../components/CreateComplaintModal';

const MachineDetails = () => {
    const { id } = useParams();
    const [machine, setMachine] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [complaints, setComplaints] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);

    const refreshData = () => {
         window.location.reload();
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const machineRes = await api.get(`machines/${id}/`);
                setMachine(machineRes.data);
                const serial = machineRes.data.serial_number;

                const [toRes, claimsRes] = await Promise.all([
                    api.get(`maintenances/?machine__serial_number=${serial}`),
                    api.get(`complaints/?machine__serial_number=${serial}`)
                ]);

                setMaintenances(toRes.data.results || toRes.data);
                setComplaints(claimsRes.data.results || claimsRes.data);

            } catch (err) {
                console.error(err);
                setError('Ошибка загрузки данных. Возможно, у вас нет доступа к этой машине.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!machine) return null;

    return (
        <Container>
            <h2 className="mb-4">Машина {machine.serial_number}</h2>

            {/* Компонент Вкладок */}
            <Tabs defaultActiveKey="info" id="machine-tabs" className="mb-3">

                {/* Вкладка 1: Общая информация */}
                <Tab eventKey="info" title="Общая инфо">
                    <Table striped bordered responsive>
                        <tbody>
                            <tr><td className="fw-bold">Зав. № машины</td><td>{machine.serial_number}</td></tr>
                            <tr><td className="fw-bold">Модель техники</td><td>{machine.technique_model}</td></tr>
                            <tr><td className="fw-bold">Модель двигателя</td><td>{machine.engine_model}</td></tr>
                            <tr><td className="fw-bold">Зав. № двигателя</td><td>{machine.engine_number}</td></tr>
                            <tr><td className="fw-bold">Модель трансмиссии</td><td>{machine.transmission_model}</td></tr>
                            <tr><td className="fw-bold">Зав. № трансмиссии</td><td>{machine.transmission_number}</td></tr>
                            <tr><td className="fw-bold">Модель вед. моста</td><td>{machine.drive_axle_model}</td></tr>
                            <tr><td className="fw-bold">Зав. № вед. моста</td><td>{machine.drive_axle_number}</td></tr>
                            <tr><td className="fw-bold">Модель упр. моста</td><td>{machine.steering_axle_model}</td></tr>
                            <tr><td className="fw-bold">Зав. № упр. моста</td><td>{machine.steering_axle_number}</td></tr>
                            <tr><td className="fw-bold">Дата отгрузки</td><td>{machine.shipment_date}</td></tr>
                            <tr><td className="fw-bold">Грузополучатель</td><td>{machine.consignee}</td></tr>
                            <tr><td className="fw-bold">Адрес поставки</td><td>{machine.delivery_address}</td></tr>
                            <tr><td className="fw-bold">Комплектация</td><td>{machine.equipment_options}</td></tr>
                            <tr><td className="fw-bold">Клиент</td><td>{machine.client}</td></tr>
                            <tr><td className="fw-bold">Сервисная компания</td><td>{machine.service_company}</td></tr>
                        </tbody>
                    </Table>
                </Tab>

                {/* Вкладка 2: ТО */}
                <Tab eventKey="to" title="ТО">
                    <div className="mb-3">
                        {/* setShowMaintenanceModal */}
                        <Button variant="success" onClick={() => setShowMaintenanceModal(true)}>
                            + Добавить ТО
                        </Button>
                    </div>
                    {maintenances.length === 0 ? <Alert variant="info">Записей о ТО нет</Alert> : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Вид ТО</th>
                                    <th>Дата</th>
                                    <th>Наработка</th>
                                    <th>Заказ-наряд</th>
                                    <th>Организация</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenances.map(to => (
                                    <tr key={to.id}>
                                        <td>{to.service_type}</td>
                                        <td>{to.event_date}</td>
                                        <td>{to.operating_hours} м/ч</td>
                                        <td>{to.order_number} от {to.order_date}</td>
                                        <td>{to.service_company}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Tab>

                {/* Вкладка 3: Рекламации */}
                <Tab eventKey="claims" title="Рекламации">
                    <div className="mb-3">
                         <Button variant="danger" onClick={() => setShowComplaintModal(true)}>
                             + Добавить рекламацию
                         </Button>
                    </div>
                    {complaints.length === 0 ? <Alert variant="info">Рекламаций нет</Alert> : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Дата отказа</th>
                                    <th>Узел</th>
                                    <th>Описание</th>
                                    <th>Восстановление</th>
                                    <th>Простой (дней)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map(claim => (
                                    <tr key={claim.id}>
                                        <td>{claim.failure_date}</td>
                                        <td>{claim.failure_node}</td>
                                        <td>{claim.failure_description}</td>
                                        <td>{claim.recovery_method} ({claim.restoration_date})</td>
                                        <td className="text-danger fw-bold">{claim.downtime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Tab>

            </Tabs>
            {/* Модальное окно */}
            {machine && (
                 <CreateMaintenanceModal
                show={showMaintenanceModal} // <--- Тут переменная Maintenance
                handleClose={() => setShowMaintenanceModal(false)}
                machineId={machine.serial_number}
                onSuccess={refreshData}
                />
            )}
            <CreateComplaintModal
                show={showComplaintModal}
                handleClose={() => setShowComplaintModal(false)}
                machineId={machine.serial_number}
                onSuccess={refreshData}
            />
        </Container>
    );
};

export default MachineDetails;