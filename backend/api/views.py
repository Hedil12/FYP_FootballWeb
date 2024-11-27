from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Member, Store, Event, Membership
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView, Response
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        # Call the default refresh method
        response = super().post(request, *args, **kwargs)
        # Get the refresh token from the response
        refresh_token = response.data.get('refresh')
        access_token = response.data.get('access')

        if refresh_token and access_token:
            # Decode the refresh token and access token
            refresh = RefreshToken(refresh_token)
            access = RefreshToken(access_token)

            # Add the role to the access token if it exists
            user = Member.objects.get(member_id=refresh['user_id'])
            access['role'] = user.role.role_type  # Add the role to the new access token

            # Return the new tokens with the role
            response.data['access'] = str(access)
            response.data['refresh'] = str(refresh)

        return response

# View to create a new Member (public access)
class CreateMemberView(generics.CreateAPIView):
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]
    queryset = Member.objects.all()


# View to retrieve and update the authenticated Member's profile
class MemberProfileView(APIView):
    queryset = Member.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Retrieve user profile."""
        serializer = MemberSerializer(request.user)  # Pass the user object
        return Response(serializer.data, status=200)

# Viewset for Store: Restricted to authenticated users
class StoreListCreateView(generics.ListCreateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
class StoreDeleteItem(generics.DestroyAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class StoreUpdateItem(generics.UpdateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    lookup_field = 'item_id'  # This is the default; it's used to identify the object via `id` in the URL

    def perform_update(self, serializer):
        # Here you can add custom logic if needed before saving
        serializer.save()

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

    def get(self, request, format=None):
        """
        Return a list of all membership information.
        """
        # Use the serializer to convert model instances to JSON-serializable data
        memberships = Membership.objects.all()
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)