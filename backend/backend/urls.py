from django.contrib import admin
from django.urls import path, include
from api.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/admin/register/", CreateMemberView.as_view(), name="register"),
    path("api/token/", CustomTokenObtainPairView.as_view(), name='get_token'),
    path("api/token/refresh/", CustomTokenRefreshView.as_view(), name='refresh'),
    path("api-auth/", include("rest_framework.urls")),
    path('api/', include('api.urls')),
]