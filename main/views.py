from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from rest_framework.filters import OrderingFilter


from .models import Machine, Maintenance, Complaint, User, ServiceType, FailureNode, RecoveryMethod
from .serializers import (
    MachineSerializer, MachineShortSerializer,
    MaintenanceSerializer, ComplaintSerializer, ServiceTypeSerializer, FailureNodeSerializer,
    RecoveryMethodSerializer
)
from .permissions import IsManager, IsService, IsClient


# -------------------------------------------------------------------------
# 1. API для Гостя (Поиск без авторизации)
# -------------------------------------------------------------------------

class GuestMachineSearchView(APIView):
    """
    Позволяет любому пользователю найти машину по заводскому номеру
    и получить ограниченные данные (поля 1-10).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        serial_number = request.query_params.get('serial_number')
        if not serial_number:
            return Response({"error": "Введите заводской номер"}, status=status.HTTP_400_BAD_REQUEST)

        machine = get_object_or_404(Machine, serial_number=serial_number)

        serializer = MachineShortSerializer(machine)
        return Response(serializer.data)


# -------------------------------------------------------------------------
# 2. API для Машин (Авторизованные)
# -------------------------------------------------------------------------

class MachineViewSet(viewsets.ModelViewSet):
    """
    CRUD для машин.
    - Менеджер: видит все, может создавать/редактировать.
    - Клиент: видит только свои (read-only).
    - Сервис: видит только машины, которые обслуживает (read-only).
    """
    serializer_class = MachineSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'technique_model__name': ['exact', 'icontains'],
        'engine_model__name': ['exact', 'icontains'],
        'transmission_model__name': ['exact', 'icontains'],
        'drive_axle_model__name': ['exact', 'icontains'],
        'steering_axle_model__name': ['exact', 'icontains'],
    }
    ordering_fields = '__all__'

    def get_queryset(self):
        user = self.request.user

        qs = Machine.objects.select_related(
            'technique_model', 'engine_model', 'transmission_model',
            'drive_axle_model', 'steering_axle_model', 'client', 'service_company'
        )

        if user.role == User.Role.MANAGER:
            return qs.all()
        elif user.role == User.Role.CLIENT:
            return qs.filter(client=user)
        elif user.role == User.Role.SERVICE:
            return qs.filter(service_company=user)

        return qs.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsManager]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


# -------------------------------------------------------------------------
# 3. API для ТО
# -------------------------------------------------------------------------

class MaintenanceViewSet(viewsets.ModelViewSet):
    """
    - Менеджер: всё.
    - Клиент: просмотр ТО своих машин.
    - Сервис: просмотр и создание ТО для своих машин.
    """
    serializer_class = MaintenanceSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['service_type', 'machine__serial_number', 'service_company']
    ordering_fields = '__all__'


    def get_queryset(self):
        user = self.request.user
        qs = Maintenance.objects.select_related('machine', 'service_type', 'service_company')

        if user.role == User.Role.MANAGER:
            return qs.all()
        elif user.role == User.Role.CLIENT:
            return qs.filter(machine__client=user)
        elif user.role == User.Role.SERVICE:
            return qs.filter(machine__service_company=user)

        return qs.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsManager | IsService]
        elif self.action == 'destroy':
            permission_classes = [IsManager]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


# -------------------------------------------------------------------------
# 4. API для Рекламаций
# -------------------------------------------------------------------------

class ComplaintViewSet(viewsets.ModelViewSet):
    """
    Логика аналогична ТО.
    """
    serializer_class = ComplaintSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['failure_node', 'recovery_method', 'service_company']
    ordering_fields = '__all__'

    def get_queryset(self):
        user = self.request.user
        qs = Complaint.objects.select_related('machine', 'failure_node', 'recovery_method', 'service_company')

        if user.role == User.Role.MANAGER:
            return qs.all()
        elif user.role == User.Role.CLIENT:
            return qs.filter(machine__client=user)
        elif user.role == User.Role.SERVICE:
            return qs.filter(machine__service_company=user)

        return qs.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsManager | IsService]
        elif self.action == 'destroy':
            permission_classes = [IsManager]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


# -------------------------------------------------------------------------
# 5. API для Справочников
# -------------------------------------------------------------------------
class ServiceTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Справочник видов ТО (только чтение).
    """
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class FailureNodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FailureNode.objects.all()
    serializer_class = FailureNodeSerializer
    permission_classes = [permissions.IsAuthenticated]


class RecoveryMethodViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RecoveryMethod.objects.all()
    serializer_class = RecoveryMethodSerializer
    permission_classes = [permissions.IsAuthenticated]