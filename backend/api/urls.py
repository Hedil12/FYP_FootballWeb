from django.urls import path
from .views import *

urlpatterns = [
    #Viewed by Members
    path('profile/', MemberProfileView.as_view(), name='profile'),
    path('products/', StoreViewSet.as_view({'get':'list'}), name='store-list'),
    path('membership/', MembershipViewSet.as_view({'get':'list'}), name='membership-list'),
    path('events/', EventViewSet.as_view({'get':'list'}), name='event-list'),

    #Viewed by Admins
    #path('create_user/', CreateMemberView.as_view(), name='create-user'),


]