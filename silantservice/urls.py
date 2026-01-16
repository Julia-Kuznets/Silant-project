"""
URL configuration for silantservice project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views as token_views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from main.views import (
    MachineViewSet,
    MaintenanceViewSet,
    ComplaintViewSet,
    GuestMachineSearchView,
    ServiceTypeViewSet,
    FailureNodeViewSet,
    RecoveryMethodViewSet,
)


# Настройка мета-данных Swagger
schema_view = get_schema_view(
   openapi.Info(
      title="Service Poguze API",
      default_version='v1',
      description="API для сервиса обслуживания погрузчиков",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)




router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')
router.register(r'complaints', ComplaintViewSet, basename='complaint')
router.register(r'service_types', ServiceTypeViewSet, basename='service_type')
router.register(r'failure_nodes', FailureNodeViewSet, basename='failure_node')
router.register(r'recovery_methods', RecoveryMethodViewSet, basename='recovery_method')

urlpatterns = [
    path('admin/', admin.site.urls),

    # 2. Кастомный путь для Гостя
    path('api/machines/search/', GuestMachineSearchView.as_view(), name='guest_search'),

    # 3. Основные маршруты API (автоматически сгенерированные роутером)
    path('api/', include(router.urls)),

    # 4. Авторизация в браузере
    path('api-auth/', include('rest_framework.urls')),

    # 5. Получение токена
    path('api/auth/token/', token_views.obtain_auth_token),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
