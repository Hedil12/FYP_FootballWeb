from rest_framework import generics, viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView, Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Member, Store, Event, Membership
from .serializers import *
from cloudinary.uploader import destroy, upload

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
class StoreListView(generics.ListAPIView):
    """
    Handles fetching the list of store items.
    """
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        products = Store.objects.all()
        serializer = StoreSerializer(products, many=True)
        return Response(serializer.data)

class StoreCreateView(generics.CreateAPIView):
    """
    Handles creating new store items.
    """
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Add custom logic before saving
        serializer.save()

    
class StoreDeleteItem(generics.DestroyAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    lookup_field = 'item_id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_destroy(self, instance):
        # Delete the associated image from Cloudinary
        if instance.item_img:
            public_id = instance.item_img.public_id
            destroy(public_id)

        # Delete the item from the database
        instance.delete()

class StoreUpdateItem(generics.UpdateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    lookup_field = 'item_id'  # This is the default; it's used to identify the object via `id` in the URL
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_update(self, serializer):
        instance = self.get_object()
        new_image = self.request.FILES.get('item_img')

        # Delete old image if a new one is uploaded
        if new_image and instance.item_img:
            public_id = instance.item_img.public_id
            destroy(public_id)
        
        serializer.save(item_img=new_image if new_image else instance.item_img)

class StoreRetrieveItem(generics.RetrieveAPIView):
        queryset = Store.objects.all()
        serializer_class = StoreSerializer
        lookup_field = 'item_id'
        authentication_classes = [JWTAuthentication]
        permission_classes = [permissions.IsAuthenticated]
        parser_classes = [MultiPartParser, FormParser]

        def get(self, request, *args, **kwargs):
            # Retrieve the object using the default mechanism
            product = self.get_object()

            # Perform any custom logic, e.g., adding metadata
            serializer = self.get_serializer(product)
            data = serializer.data
            return Response(data)

# Viewset for Event: Restricted to authenticated users
class EventViewSet(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)

class EventRetrieveView(generics.RetrieveAPIView):
        queryset = Event.objects.all()
        serializer_class = EventSerializer
        lookup_field = 'event_id'
        authentication_classes = [JWTAuthentication]
        permission_classes = [permissions.IsAuthenticated]
        parser_classes = [MultiPartParser, FormParser]

        def get(self, request, *args, **kwargs):
            # Retrieve the object using the default mechanism
            event = self.get_object()

            # Perform any custom logic, e.g., adding metadata
            serializer = self.get_serializer(event)
            data = serializer.data
            return Response(data)

class EventCreateView(generics.CreateAPIView):
    """
    Handles creating new store items.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Add custom logic before saving
        serializer.save()

class EventUpdateView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'event_id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        instance = self.get_object()
        new_image = self.request.FILES.get('event_img')

        # Delete old image if a new one is uploaded
        if new_image and instance.event_img:
            public_id = instance.event_img.public_id
            destroy(public_id)
        
        serializer.save(event_img=new_image if new_image else instance.event_img)

class EventDeleteView(generics.DestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    lookup_field = 'event_id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        # Delete the associated image from Cloudinary
        if instance.event_img:
            public_id = instance.event_img.public_id
            destroy(public_id)

        # Delete the item from the database
        instance.delete()

# Read-only viewset for Membership: Restricted to authenticated users
class MembershipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Return a list of all membership information.
        """
        # Use the serializer to convert model instances to JSON-serializable data
        memberships = Membership.objects.all()
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)