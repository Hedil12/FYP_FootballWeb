from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    #Viewed by Members
    path('profile/', MemberProfileView.as_view(), name='member-profile'),
    path('products/', StoreListView.as_view(), name='store-list-retrieve'),
    path('membership/', MembershipViewSet.as_view({'get':'list'}), name='membership-list'),
    path('events/', EventViewSet.as_view(), name='event-list'),

    #Viewed for Admins
    #Products
    path('products/create/', StoreCreateView.as_view(), name='store-create'),
    path('products/delete/<int:item_id>/', StoreDeleteItem.as_view(), name='store-delete'),
    path('products/edit/<int:item_id>/', StoreUpdateItem.as_view(), name='store-update'),
    path('products/retrieve/<int:item_id>/', StoreRetrieveItem.as_view(), name='store-retrieval'),
    #Carts
    path("cart/add/", AddToCartView.as_view(), name="add_to_cart"),
    path("cart/view/", ViewCartView.as_view(), name="view_cart"),
    path("cart/remove/", RemoveFromCartView.as_view(), name="remove_from_cart"),
    path("cart/checkout/", CheckoutView.as_view(), name="checkout"),
    #Event
    path('events/create/', EventCreateView.as_view(), name='event-list'),
    path('events/delete/<int:event_id>/', EventDeleteView.as_view(), name='event-list'),
    path('events/edit/<int:event_id>/', EventUpdateView.as_view(), name='event-list'),
    path('events/retrieve/<int:event_id>/', EventRetrieveView.as_view(), name='event-retrieval')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)