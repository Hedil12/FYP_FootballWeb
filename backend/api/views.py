from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView, Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
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

    def perform_create(self, serializer):
        # Add custom logic before saving
        serializer.save()

# View to retrieve and update the authenticated Member's profile
class MemberProfileView(APIView):
    queryset = Member.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Retrieve user profile."""
        serializer = MemberSerializer(request.user)  # Pass the user object
        return Response(serializer.data, status=200)

class MembersListView(generics.ListAPIView):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = Member.objects.all()
        serializer = MemberSerializer(users, many=True)
        return Response(serializer.data)

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

# Viewset for adding Items to Cart: Restricted to authenticated users
class AddToCartView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        user = request.user
        product = get_object_or_404(Store, pk=product_id)
        quantity = int(request.data.get('quantity', 1))  # Default to 1 if not provided

        # Get or create the user's cart
        cart, created = Cart.objects.get_or_create(user=user)

        # Check if the product is already in the cart
        cart_item, created = CartItems.objects.get_or_create(member=user, item=product)
        if not created:
            # If the item already exists, update the quantity
            cart_item.qty += quantity
        else:
            # If the item is new, set the quantity
            cart_item.qty = quantity

        # Save the cart item
        cart_item.save()

        # Add the cart item to the cart
        cart.items.add(cart_item)

        return Response(
            {'message': 'Product added to cart.'},
            status=status.HTTP_200_OK
        )

class ViewCart(APIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]  # Only authenticated users can access this view

    def get(self, request):
        user = request.user  # Get the authenticated user
        cart = get_object_or_404(Cart, user=user)  # Fetch the user's cart or raise a 404

        # Prepare the cart items for the response
        cart_items = [
            {
                
                'product': {
                    'cartItem_id': item.id,#Cart, qty, item, user
                    'cart_id': cart.id, # Cart is for user and its items
                    'id': item.item.item_id, # Store id
                    'name': item.item.item_name,
                    'price': item.item.item_price,
                    'image': item.item.item_img.url if item.item.item_img else None
                },
                'quantity': item.qty
            }
            for item in cart.items.all()
        ]

        return Response({
            'cart_items': cart_items,
            'total_price': cart.calculate_total()  # Include the total price of the cart
        })
        

class DeleteCartItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        user = request.user
        product = get_object_or_404(Store, pk=item_id)
        cart = Cart.objects.get(user=user)

        # Get the cart item to delete
        cart_item = get_object_or_404(CartItems, item=product, member=user)

        # Delete the item
        cart_item.delete()

        return Response(
            {'message': 'Item removed from cart.'},
            status=status.HTTP_204_NO_CONTENT
        )
        
class UpdateCartItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        user = request.user
        new_quantity = int(request.data.get('quantity'))

        # Get the cart item to update
        cart_item = get_object_or_404(CartItems, id=item_id, member=user)

        # Update the quantity
        cart_item.qty = new_quantity
        cart_item.save()

        return Response(
            {'message': 'Quantity updated.'},
            status=status.HTTP_200_OK
        )

class ProceedToPaymentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        cart = get_object_or_404(Cart, user=user)

        # Validate cart items and deduct quantities
        for cart_item in cart.items.all():
            item = cart_item.item
            if item.item_qty < cart_item.qty:
                return Response({
                    'message': f'Not enough stock for {item.item_name}. Available: {item.item_qty}'
                }, status=status.HTTP_400_BAD_REQUEST)

            item.item_qty -= cart_item.qty
            item.save()

        # Clear the cart
        cart.items.clear()

        return Response({
            'message': 'Payment successful. Cart cleared.'
        }, status=status.HTTP_200_OK)

class MembershipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = Membership.objects.all()
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)
