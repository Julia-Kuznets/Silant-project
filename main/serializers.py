from rest_framework import serializers
from .models import (
    User, Machine, Maintenance, Complaint,
    TechniqueModel, EngineModel, TransmissionModel, DriveAxleModel,
    SteeringAxleModel, ServiceType, FailureNode, RecoveryMethod
)
from datetime import date


# -------------------------------------------------------------------------
# 1. Сериализаторы Справочников
# -------------------------------------------------------------------------


class BaseHandbookSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'name', 'description']



class TechniqueModelSerializer(BaseHandbookSerializer):
    class Meta(BaseHandbookSerializer.Meta):
        model = TechniqueModel


class EngineModelSerializer(BaseHandbookSerializer):
    class Meta(BaseHandbookSerializer.Meta):
        model = EngineModel


class TransmissionModelSerializer(BaseHandbookSerializer):
    class Meta(BaseHandbookSerializer.Meta):
        model = TransmissionModel


class DriveAxleModelSerializer(BaseHandbookSerializer):
    class Meta(BaseHandbookSerializer.Meta):
        model = DriveAxleModel


class SteeringAxleModelSerializer(BaseHandbookSerializer):
    class Meta(BaseHandbookSerializer.Meta):
        model = SteeringAxleModel


class ServiceTypeSerializer(BaseHandbookSerializer):
    class Meta(BaseHandbookSerializer.Meta):
        model = ServiceType


class FailureNodeSerializer(BaseHandbookSerializer):
    class Meta(BaseHandbookSerializer.Meta):
        model = FailureNode


class RecoveryMethodSerializer(BaseHandbookSerializer):
    class Meta(BaseHandbookSerializer.Meta):
        model = RecoveryMethod


# -------------------------------------------------------------------------
# 2. Сериализаторы Пользователя
# -------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'role']


# -------------------------------------------------------------------------
# 3. Основные Сериализаторы (Машина, ТО, Рекламация)
# -------------------------------------------------------------------------

class MachineSerializer(serializers.ModelSerializer):

    technique_model = serializers.SlugRelatedField(slug_field='name', queryset=TechniqueModel.objects.all())
    engine_model = serializers.SlugRelatedField(slug_field='name', queryset=EngineModel.objects.all())
    transmission_model = serializers.SlugRelatedField(slug_field='name', queryset=TransmissionModel.objects.all())
    drive_axle_model = serializers.SlugRelatedField(slug_field='name', queryset=DriveAxleModel.objects.all())
    steering_axle_model = serializers.SlugRelatedField(slug_field='name', queryset=SteeringAxleModel.objects.all())

    client = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.filter(role=User.Role.CLIENT))
    service_company = serializers.SlugRelatedField(slug_field='username',
                                                   queryset=User.objects.filter(role=User.Role.SERVICE))

    class Meta:
        model = Machine
        fields = [
            'id', 'serial_number', 'technique_model', 'engine_model', 'engine_number',
            'transmission_model', 'transmission_number', 'drive_axle_model', 'drive_axle_number',
            'steering_axle_model', 'steering_axle_number', 'supply_contract_num_date',
            'shipment_date', 'consignee', 'delivery_address', 'equipment_options',
            'client', 'service_company'
        ]


class MaintenanceSerializer(serializers.ModelSerializer):
    service_type = serializers.SlugRelatedField(slug_field='name', queryset=ServiceType.objects.all())
    service_company = serializers.SlugRelatedField(slug_field='username',
                                                   queryset=User.objects.filter(role__in=[User.Role.SERVICE, User.Role.MANAGER]))

    machine = serializers.SlugRelatedField(slug_field='serial_number', queryset=Machine.objects.all())

    def validate_event_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("Дата проведения ТО не может быть в будущем!")
        return value

    class Meta:
        model = Maintenance
        fields = [
            'id', 'machine', 'service_type', 'event_date', 'operating_hours',
            'order_number', 'order_date', 'service_company'
        ]


class ComplaintSerializer(serializers.ModelSerializer):
    failure_node = serializers.SlugRelatedField(slug_field='name', queryset=FailureNode.objects.all())
    recovery_method = serializers.SlugRelatedField(slug_field='name', queryset=RecoveryMethod.objects.all())
    service_company = serializers.SlugRelatedField(slug_field='username',
                                                   queryset=User.objects.filter(role__in=[User.Role.SERVICE, User.Role.MANAGER]))
    machine = serializers.SlugRelatedField(slug_field='serial_number', queryset=Machine.objects.all())

    downtime = serializers.IntegerField(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'machine', 'failure_date', 'operating_hours', 'failure_node',
            'failure_description', 'recovery_method', 'spare_parts_used',
            'restoration_date', 'service_company', 'downtime'
        ]

    def validate_failure_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("Дата отказа не может быть в будущем!")
        return value

    def validate_restoration_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("Дата восстановления не может быть в будущем!")
        return value


    def validate(self, data):
        if 'failure_date' in data and 'restoration_date' in data:
            if data['restoration_date'] < data['failure_date']:
                raise serializers.ValidationError("Дата восстановления не может быть раньше даты отказа!")
        return data


class MachineShortSerializer(serializers.ModelSerializer):
    """
    Урезанный сериализатор для неавторизованных пользователей (Гостей).
    Только технические характеристики (поля 1-10 из ТЗ).
    """
    technique_model = serializers.SlugRelatedField(slug_field='name', queryset=TechniqueModel.objects.all())
    engine_model = serializers.SlugRelatedField(slug_field='name', queryset=EngineModel.objects.all())
    transmission_model = serializers.SlugRelatedField(slug_field='name', queryset=TransmissionModel.objects.all())
    drive_axle_model = serializers.SlugRelatedField(slug_field='name', queryset=DriveAxleModel.objects.all())
    steering_axle_model = serializers.SlugRelatedField(slug_field='name', queryset=SteeringAxleModel.objects.all())

    class Meta:
        model = Machine
        fields = [
            'serial_number', 'technique_model', 'engine_model', 'engine_number',
            'transmission_model', 'transmission_number', 'drive_axle_model', 'drive_axle_number',
            'steering_axle_model', 'steering_axle_number'
        ]