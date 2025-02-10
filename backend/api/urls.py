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
    path('cart/view/', ViewCart.as_view(), name='view_cart'),

    #Viewed for Admins
    path('members/', MembersListView.as_view(), name='Member-list'),
    path('members/update/<int:member_id>/', MemberUpdateView.as_view(), name='member-update'),
    path('members/delete/<int:member_id>/', MemberDeleteView.as_view(), name='member-delete'),


    #Products
    path('products/create/', StoreCreateView.as_view(), name='store-create'),
    path('products/delete/<int:item_id>/', StoreDeleteItem.as_view(), name='store-delete'),
    path('products/edit/<int:item_id>/', StoreUpdateItem.as_view(), name='store-update'),
    path('products/retrieve/<int:item_id>/', StoreRetrieveItem.as_view(), name='store-retrieval'),
    path('products/product-groups/', ProductGroupViewSet.as_view({'get':'list'}), name='checkout'),
    path('products/associate/<int:pk>/', AssociateProductsView.as_view(), name='associate-products'),
    path('products/disassociate/', AssociateProductsDelete.as_view(), name='disassociate-products'),
    path('products/<int:pk>/disassociate/update/', AssociateProductsUpdate.as_view(), name='update-associate-product'),
    
    #Event
    path('events/create/', EventCreateView.as_view(), name='event-list'),
    path('events/delete/<int:event_id>/', EventDeleteView.as_view(), name='event-list'),
    path('events/edit/<int:event_id>/', EventUpdateView.as_view(), name='event-list'),
    path('events/retrieve/<int:event_id>/', EventRetrieveView.as_view(), name='event-retrieval'),

    #Cart
    path('cart/add/<int:product_id>/', AddToCartView.as_view(), name='add_to_cart'),
    path('cart/delete/<int:product_id>/', DeleteCartItemView.as_view(), name='remove-from-cart'),
    path('cart/update/<int:cartItem_id>/', UpdateCartItemView.as_view(), name='update-item'),
    path('cart/proceed-to-payment/', ProceedToPaymentView.as_view(), name='proceed-to-payment')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)