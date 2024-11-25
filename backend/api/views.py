from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Member, Store, Event, Membership
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView, Response
from .permissions import IsAdmin, IsUser
from django.http import JsonResponse

class AdminOnlyView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return JsonResponse({"message": "Welcome Admin!"})


class UserOnlyView(APIView):
    permission_classes = [IsUser]

    def get(self, request):
        return JsonResponse({"message": "Welcome User!"})

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

# View to create a new Member (public access)
class CreateMemberView(generics.CreateAPIView):
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]
    queryset = Member.objects.all()


# View to retrieve and update the authenticated Member's profile
class MemberProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve user profile."""
        serializer = MemberSerializer(request.user)  # Pass the user object
        return Response(serializer.data, status=200)

# Viewset for Store: Restricted to authenticated users
class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]

    # Allows filtering by item name or description
    def get_queryset(self):
        queryset = Store.objects.all()
        item_name = self.request.query_params.get('item_name', None)
        if item_name:
            queryset = queryset.filter(item_name__icontains=item_name)
        return queryset


# Viewset for Event: Restricted to authenticated users
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    # Filter events by activity status or search by name
    def get_queryset(self):
        queryset = Event.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        if is_active:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        event_name = self.request.query_params.get('event_name', None)
        if event_name:
            queryset = queryset.filter(event_name__icontains=event_name)
        return queryset


# Read-only viewset for Membership: Restricted to authenticated users
class MembershipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]
