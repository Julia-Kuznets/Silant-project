from django.db import models

from django.contrib.auth.models import AbstractUser


# -------------------------------------------------------------------------
# 1. Пользователи и Роли
# -------------------------------------------------------------------------

class User(AbstractUser):
    """
    Кастомная модель пользователя.
    Поле роли для разграничения прав доступа.
    """

    class Role(models.TextChoices):
        CLIENT = 'CLIENT', 'Клиент'
        SERVICE = 'SERVICE', 'Сервисная организация'
        MANAGER = 'MANAGER', 'Менеджер'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT,
        verbose_name='Роль пользователя'
    )


    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'


# -------------------------------------------------------------------------
# 2. Абстрактный класс для Справочников
# -------------------------------------------------------------------------

class BaseHandbook(models.Model):
    """
    Базовая модель для всех справочников.
    Содержит название и описание.
    """
    name = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


# -------------------------------------------------------------------------
# 3. Реализация Справочников
# -------------------------------------------------------------------------

class TechniqueModel(BaseHandbook):
    class Meta:
        verbose_name = 'Модель техники'
        verbose_name_plural = 'Справочник: Модели техники'


class EngineModel(BaseHandbook):
    class Meta:
        verbose_name = 'Модель двигателя'
        verbose_name_plural = 'Справочник: Модели двигателей'


class TransmissionModel(BaseHandbook):
    class Meta:
        verbose_name = 'Модель трансмиссии'
        verbose_name_plural = 'Справочник: Модели трансмиссии'


class DriveAxleModel(BaseHandbook):
    class Meta:
        verbose_name = 'Модель ведущего моста'
        verbose_name_plural = 'Справочник: Модели ведущих мостов'


class SteeringAxleModel(BaseHandbook):
    class Meta:
        verbose_name = 'Модель управляемого моста'
        verbose_name_plural = 'Справочник: Модели управляемых мостов'


class ServiceType(BaseHandbook):
    class Meta:
        verbose_name = 'Вид ТО'
        verbose_name_plural = 'Справочник: Виды ТО'


class FailureNode(BaseHandbook):
    class Meta:
        verbose_name = 'Узел отказа'
        verbose_name_plural = 'Справочник: Узлы отказа'


class RecoveryMethod(BaseHandbook):
    class Meta:
        verbose_name = 'Способ восстановления'
        verbose_name_plural = 'Справочник: Способы восстановления'


# -------------------------------------------------------------------------
# 4. Основные сущности
# -------------------------------------------------------------------------

class Machine(models.Model):
    """
    Машина (Погрузчик).
    """
    serial_number = models.CharField(max_length=100, unique=True, verbose_name='Зав. № машины')
    technique_model = models.ForeignKey(TechniqueModel, on_delete=models.PROTECT, verbose_name='Модель техники')

    engine_model = models.ForeignKey(EngineModel, on_delete=models.PROTECT, verbose_name='Модель двигателя')
    engine_number = models.CharField(max_length=100, verbose_name='Зав. № двигателя')

    transmission_model = models.ForeignKey(TransmissionModel, on_delete=models.PROTECT,
                                           verbose_name='Модель трансмиссии')
    transmission_number = models.CharField(max_length=100, verbose_name='Зав. № трансмиссии')

    drive_axle_model = models.ForeignKey(DriveAxleModel, on_delete=models.PROTECT, verbose_name='Модель ведущего моста')
    drive_axle_number = models.CharField(max_length=100, verbose_name='Зав. № ведущего моста')

    steering_axle_model = models.ForeignKey(SteeringAxleModel, on_delete=models.PROTECT,
                                            verbose_name='Модель управляемого моста')
    steering_axle_number = models.CharField(max_length=100, verbose_name='Зав. № управляемого моста')

    supply_contract_num_date = models.CharField(max_length=255, verbose_name='Договор поставки №, дата')
    shipment_date = models.DateField(verbose_name='Дата отгрузки с завода')
    consignee = models.CharField(max_length=255, verbose_name='Грузополучатель')
    delivery_address = models.CharField(max_length=255, verbose_name='Адрес поставки (эксплуатации)')
    equipment_options = models.TextField(blank=True, verbose_name='Комплектация (доп. опции)')

    # Ссылки на пользователей
    client = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='client_machines',
        limit_choices_to={'role': User.Role.CLIENT},
        verbose_name='Клиент'
    )
    service_company = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='service_machines',
        limit_choices_to={'role': User.Role.SERVICE},
        verbose_name='Сервисная компания'
    )

    class Meta:
        verbose_name = 'Машина'
        verbose_name_plural = 'Машины'
        ordering = ['shipment_date']  # Сортировка по умолчанию (из ТЗ)

    def __str__(self):
        return f"{self.technique_model} - {self.serial_number}"


class Maintenance(models.Model):
    """
    ТО (Техническое обслуживание).
    """
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='maintenances', verbose_name='Машина')
    service_type = models.ForeignKey(ServiceType, on_delete=models.PROTECT, verbose_name='Вид ТО')
    event_date = models.DateField(verbose_name='Дата проведения ТО')
    operating_hours = models.PositiveIntegerField(verbose_name='Наработка, м/час')
    order_number = models.CharField(max_length=100, verbose_name='№ заказ-наряда')
    order_date = models.DateField(verbose_name='Дата заказ-наряда')

    service_company = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='conducted_maintenances',
        limit_choices_to={'role': User.Role.SERVICE},
        verbose_name='Организация, проводившая ТО'
    )

    class Meta:
        verbose_name = 'ТО'
        verbose_name_plural = 'ТО'
        ordering = ['event_date']  # Сортировка по умолчанию

    def __str__(self):
        return f"{self.service_type} - {self.machine.serial_number}"


class Complaint(models.Model):
    """
    Рекламация.
    """
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='complaints', verbose_name='Машина')
    failure_date = models.DateField(verbose_name='Дата отказа')
    operating_hours = models.PositiveIntegerField(verbose_name='Наработка, м/час')
    failure_node = models.ForeignKey(FailureNode, on_delete=models.PROTECT, verbose_name='Узел отказа')
    failure_description = models.TextField(verbose_name='Описание отказа')
    recovery_method = models.ForeignKey(RecoveryMethod, on_delete=models.PROTECT, verbose_name='Способ восстановления')
    spare_parts_used = models.TextField(blank=True, verbose_name='Используемые запасные части')
    restoration_date = models.DateField(verbose_name='Дата восстановления')

    service_company = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='fixed_complaints',
        limit_choices_to={'role': User.Role.SERVICE},
        verbose_name='Сервисная компания'
    )

    @property
    def downtime(self):
        """
        Расчетное поле: Время простоя техники (дни).
        [Дата восстановления] - [Дата отказа]
        """
        if self.restoration_date and self.failure_date:
            delta = self.restoration_date - self.failure_date
            return delta.days
        return 0

    class Meta:
        verbose_name = 'Рекламация'
        verbose_name_plural = 'Рекламации'
        ordering = ['failure_date']  # Сортировка по умолчанию

    def __str__(self):
        return f"Отказ {self.failure_node} - {self.machine.serial_number}"
