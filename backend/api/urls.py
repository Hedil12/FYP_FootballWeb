from django.urls import path
from .views import MemberProfileView, CreateMemberView, ProductListView, IncentiveListView, EventViewSet

urlpatterns = [
    #Viewed by Members
    path('profile/', MemberProfileView.as_view(), name='profile'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('incentives/', IncentiveListView.as_view(), name='incentive-list'),
    path('events/', EventViewSet.as_view({'get':'list'}), name='event-list'),

    #Viewed by Admins
    path('create_user/', CreateMemberView.as_view(), name='create-user'),


]