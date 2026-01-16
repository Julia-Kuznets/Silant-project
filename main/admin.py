from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Machine, Maintenance, Complaint,
    TechniqueModel, EngineModel, TransmissionModel, DriveAxleModel,
    SteeringAxleModel, ServiceType, FailureNode, RecoveryMethod
)

# 1. Настройка пользователя
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Дополнительная информация', {'fields': ('role',)}),
    )

# 2. Настройка Машины
@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ('serial_number', 'technique_model', 'client', 'service_company', 'shipment_date')
    list_filter = ('technique_model', 'client', 'service_company')
    search_fields = ('serial_number', 'client__username')

# 3. Настройка ТО
@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('machine', 'service_type', 'event_date', 'service_company')
    list_filter = ('service_type', 'service_company')
    search_fields = ('machine__serial_number', 'order_number')

# 4. Настройка Рекламации
@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('machine', 'failure_node', 'failure_date', 'restoration_date', 'downtime')
    list_filter = ('failure_node', 'service_company')


# 5. Регистрация справочников
admin.site.register(TechniqueModel)
admin.site.register(EngineModel)
admin.site.register(TransmissionModel)
admin.site.register(DriveAxleModel)
admin.site.register(SteeringAxleModel)
admin.site.register(ServiceType)
admin.site.register(FailureNode)
admin.site.register(RecoveryMethod)