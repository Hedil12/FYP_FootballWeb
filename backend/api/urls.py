from django.urls import path
from .views import *

urlpatterns = [
    #Viewed by Members
    path('profile/', MemberProfileView.as_view(), name='profile'),
    path('products/', StoreListCreateView.as_view(), name='store-list-create'),
    path('products/delete/<int:item_id>/', StoreDeleteItem.as_view(), name='store-delete'),
    path('products/edit/<int:item_id>/', StoreUpdateItem.as_view(), name='store-update'),
    path('membership/', MembershipViewSet.as_view({'get':'list'}), name='membership-list'),
    path('events/', EventViewSet.as_view({'get':'list'}), name='event-list'),

    #Viewed by Admins
    #path('create_user/', CreateMemberView.as_view(), name='create-user'),


]