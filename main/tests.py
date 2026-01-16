from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, Machine, TechniqueModel, EngineModel, TransmissionModel, DriveAxleModel, SteeringAxleModel


class AccessTests(APITestCase):
    def setUp(self):
        self.tech = TechniqueModel.objects.create(name="Tech1", description="D")
        self.eng = EngineModel.objects.create(name="Eng1", description="D")
        self.trans = TransmissionModel.objects.create(name="Trans1", description="D")
        self.drive = DriveAxleModel.objects.create(name="Drive1", description="D")
        self.steer = SteeringAxleModel.objects.create(name="Steer1", description="D")

        self.client_1 = User.objects.create_user(username='client1', password='123', role=User.Role.CLIENT)
        self.client_2 = User.objects.create_user(username='client2', password='123', role=User.Role.CLIENT)
        self.manager = User.objects.create_user(username='manager', password='123', role=User.Role.MANAGER)

        self.machine_1 = Machine.objects.create(
            serial_number="0001",
            technique_model=self.tech,
            engine_model=self.eng,
            engine_number="123",
            transmission_model=self.trans,
            transmission_number="123",
            drive_axle_model=self.drive,
            drive_axle_number="123",
            steering_axle_model=self.steer,
            steering_axle_number="123",
            supply_contract_num_date="Contract",
            shipment_date="2023-01-01",
            consignee="Client 1",
            delivery_address="Addr",
            client=self.client_1,
            service_company=self.manager
        )

    def test_client_can_see_own_machine(self):
        """Клиент 1 должен видеть свою машину"""
        self.client.force_authenticate(user=self.client_1)
        url = reverse('machine-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['serial_number'], "0001")

    def test_client_cannot_see_others_machine(self):
        """Клиент 2 НЕ должен видеть машину Клиента 1"""
        self.client.force_authenticate(user=self.client_2)
        url = reverse('machine-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_manager_sees_all(self):
        """Менеджер видит всё"""
        self.client.force_authenticate(user=self.manager)
        url = reverse('machine-list')
        response = self.client.get(url)

        self.assertEqual(len(response.data['results']), 1)