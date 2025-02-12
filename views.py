from rest_framework import generics, viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView, Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from decimal import Decimal
from .models import Member, Store, Event, Membership, Cart
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

class AddToCartView(APIView):
    """
    API to add an item to the cart.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        item_id = request.data.get("item_id")
        quantity = int(request.data.get("quantity", 1))  # Default to 1

        try:
            item = Store.objects.get(item_id=item_id)

            if not item.is_available:
                return Response({"message": f"Item '{item.item_name}' is not available."}, status=400)

            if item.item_qty < quantity:
                return Response({"message": f"Only {item.item_qty} units of '{item.item_name}' are available."}, status=400)

            # Apply membership discount if applicable
            membership_discount = user.membership.discount_rates if user.membership else 0
            effective_price = item.item_price - (item.discount_rates + membership_discount)
            item_total = effective_price * quantity

            Cart.objects.create(
                member=user,
                item=item,
                total_amount=item_total
            )

            item.item_qty -= quantity
            item.save()

            return Response({"message": f"{quantity}x '{item.item_name}' added to your cart."}, status=200)

        except Store.DoesNotExist:
            return Response({"message": "Item does not exist."}, status=404)


class ViewCartView(APIView):
    """
    API to view the user's cart.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cart_items = Cart.objects.filter(member=user)

        if not cart_items.exists():
            return Response({"message": "Your cart is empty."}, status=200)

        result = [
            {
                "item_name": cart_item.item.item_name,
                "quantity": 1,  # Assuming each cart entry is one unit
                "price_per_item": cart_item.item.item_price,
                "discount_applied": cart_item.item.discount_rates + user.membership.discount_rates if user.membership else 0,
                "total_price": cart_item.total_amount
            }
            for cart_item in cart_items
        ]

        return Response(result, status=200)


class RemoveFromCartView(APIView):
    """
    API to remove an item from the cart.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        cart_id = request.data.get("cart_id")

        try:
            cart_item = Cart.objects.get(id=cart_id, member=user)
            item = cart_item.item

            # Restore item quantity
            item.item_qty += 1  # Assuming one unit per cart entry
            item.save()

            cart_item.delete()
            return Response({"message": f"Item '{item.item_name}' removed from your cart."}, status=200)

        except Cart.DoesNotExist:
            return Response({"message": "Item not found in your cart."}, status=404)


class CheckoutView(APIView):
    """
    API to checkout and clear the cart.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        cart_items = Cart.objects.filter(member=user)

        if not cart_items.exists():
            return Response({"message": "Your cart is empty."}, status=400)

        total_amount = sum(cart_item.total_amount for cart_item in cart_items)

        # Calculate cashback if applicable
        cashback_rate = user.membership.cashback_rates if user.membership else Decimal("0.0")
        cashback = total_amount * cashback_rate

        # Clear the cart
        cart_items.delete()

        return Response({
            "message": f"Checkout successful. Total: ${total_amount:.2f}, Cashback: ${cashback:.2f}"
        }, status=200)