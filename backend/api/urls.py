from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Member-specific URLs
    path('profile/', MemberProfileView.as_view(), name='member-profile'),
    path('products/', StoreListView.as_view(), name='store-list-retrieve'),
    path('membership/', MembershipViewSet.as_view({'get': 'list'}), name='membership-list'),
    path('events/', EventViewSet.as_view({'get': 'list'}), name='event-list'),  # Event list for members

    # Admin-specific Product URLs
    path('products/create/', StoreCreateView.as_view(), name='store-create'),
    path('products/delete/<int:item_id>/', StoreDeleteItem.as_view(), name='store-delete'),
    path('products/edit/<int:item_id>/', StoreUpdateItem.as_view(), name='store-update'),
    path('products/retrieve/<int:item_id>/', StoreRetrieveItem.as_view(), name='store-retrieve'),

    # Admin-specific Event URLs
    path('events/create/', EventCreateView.as_view(), name='event-create'),
    path('events/delete/<int:event_id>/', EventDeleteView.as_view(), name='event-delete'),
    path('events/edit/<int:event_id>/', EventUpdateView.as_view(), name='event-edit'),
    path('events/retrieve/<int:event_id>/', EventRetrieveView.as_view(), name='event-retrieve'),
]

# Serving media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
