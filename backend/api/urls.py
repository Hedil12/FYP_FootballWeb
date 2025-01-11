from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    #Viewed by Members
    path('profile/', MemberProfileView.as_view(), name='member-profile'),
    path('products/', StoreListView.as_view(), name='store-list-retrieve'),
    path('membership/', MembershipViewSet.as_view({'get':'list'}), name='membership-list'),

    #Viewed for Admins
    path('products/create/', StoreCreateView.as_view(), name='store-create'),
    path('products/delete/<int:item_id>/', StoreDeleteItem.as_view(), name='store-delete'),
    path('products/edit/<int:item_id>/', StoreUpdateItem.as_view(), name='store-update'),
    path('events/', EventViewSet.as_view({'get':'list'}), name='event-list'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)