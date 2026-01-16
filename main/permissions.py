from rest_framework import permissions
from .models import User

class IsManager(permissions.BasePermission):
    """
    Разрешает доступ только Менеджеру.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.MANAGER

class IsService(permissions.BasePermission):
    """
    Разрешает доступ Сервисной организации.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.SERVICE

class IsClient(permissions.BasePermission):
    """
    Разрешает доступ Клиенту.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.CLIENT

