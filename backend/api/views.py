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
import json

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh_token = response.data.get('refresh')
        access_token = response.data.get('access')

        if refresh_token and access_token:
            refresh = RefreshToken(refresh_token)
            access = RefreshToken(access_token)
            user = Member.objects.get(member_id=refresh['user_id'])
            access['role'] = user.role.role_type
            response.data['access'] = str(access)
            response.data['refresh'] = str(refresh)

        return response

class CreateMemberView(generics.CreateAPIView):
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]
    queryset = Member.objects.all()

    def perform_create(self, serializer):
        serializer.save()

class MemberProfileView(APIView):
    queryset = Member.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = MemberSerializer(request.user)
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

class MemberUpdateView(generics.UpdateAPIView):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    lookup_field = 'member_id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save()

class MemberDeleteView(generics.DestroyAPIView):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    lookup_field = 'member_id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.delete()

class StoreListView(generics.ListAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        standalone_products = Store.objects.filter(product_group__isnull=True)
        group_main_products = Store.objects.filter(product_group__isnull=False).order_by('product_group').distinct('product_group')
        return standalone_products.union(group_main_products)
    
    def get(self, request):
        products = Store.objects.all()
        serializer = StoreSerializer(products, many=True)
        return Response(serializer.data)

class StoreCreateView(generics.CreateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        image_file = self.request.FILES.get('item_img')
        if image_file:
            uploaded_image = upload(image_file)
            serializer.save(item_img=uploaded_image['public_id'])
        else:
            serializer.save()

class StoreDeleteItem(generics.DestroyAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    lookup_field = 'item_id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_destroy(self, instance):
        if instance.item_img:
            public_id = instance.item_img.public_id
            destroy(public_id)
        instance.delete()

class StoreUpdateItem(generics.UpdateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    lookup_field = 'item_id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_update(self, serializer):
        instance = self.get_object()
        new_image = self.request.FILES.get('item_img')
        if new_image and instance.item_img:
            public_id = instance.item_img.public_id
            destroy(public_id)
        serializer.save(item_img=new_image if new_image else instance.item_img)
    
    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data={'product_group': None}, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({'success': 'Product disassociated successfully.'}, status=status.HTTP_200_OK)

class StoreRetrieveItem(generics.RetrieveAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    lookup_field = 'item_id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        product = self.get_object()
        related_products = Store.objects.filter(product_group=product.product_group) if product.product_group else []
        serializer = self.get_serializer(product)
        data = serializer.data
        data['available_sizes'] = [p.size for p in related_products if p.size] if product.product_group else []
        return Response(data)

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
            event = self.get_object()
            serializer = self.get_serializer(event)
            data = serializer.data
            return Response(data)

class EventCreateView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
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
        if instance.event_img:
            public_id = instance.event_img.public_id
            destroy(public_id)
        instance.delete()

class AddToCartView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        user = request.user
        product = get_object_or_404(Store, pk=product_id)
        quantity = int(request.data.get('quantity', 1))
        cart, created = Cart.objects.get_or_create(user=user)
        cart_item, created = CartItems.objects.get_or_create(member=user, item=product)
        if not created:
            cart_item.qty += quantity
        else:
            cart_item.qty = quantity
        cart_item.save()
        cart.items.add(cart_item)
        return Response({'message': 'Product added to cart.'}, status=status.HTTP_200_OK)

class ViewCart(APIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cart = get_object_or_404(Cart, user=user)
        cart_items = [
            {
                'product': {
                    'cartItem_id': item.id,
                    'cart_id': cart.id,
                    'id': item.item.item_id,
                    'name': item.item.item_name,
                    'price': item.item.item_price,
                    'image': item.item.item_img.url if item.item.item_img else None,
                    'size' : item.item.size
                },
                'quantity': item.qty
            }
            for item in cart.items.all()
        ]
        return Response({'cart_items': cart_items, 'total_price': cart.calculate_total()})

class DeleteCartItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id):
        user = request.user
        product = get_object_or_404(Store, pk=product_id)
        cart = Cart.objects.get(user=user)
        cart_item = get_object_or_404(CartItems, item=product, member=user)
        cart_item.delete()
        return Response({'message': 'Item removed from cart.'}, status=status.HTTP_204_NO_CONTENT)

class UpdateCartItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        user = request.user
        new_quantity = int(request.data.get('quantity'))
        cart_item = get_object_or_404(CartItems, id=item_id, member=user)
        cart_item.qty = new_quantity
        cart_item.save()
        return Response({'message': 'Quantity updated.'}, status=status.HTTP_200_OK)

class ProceedToPaymentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        cart = get_object_or_404(Cart, user=user)
        for cart_item in cart.items.all():
            item = cart_item.item
            if item.item_qty < cart_item.qty:
                return Response({'message': f'Not enough stock for {item.item_name}. Available: {item.item_qty}'}, status=status.HTTP_400_BAD_REQUEST)
            item.item_qty -= cart_item.qty
            item.save()
        cart.items.clear()
        return Response({'message': 'Payment successful. Cart cleared.'}, status=status.HTTP_200_OK)

class MembershipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        memberships = Membership.objects.all()
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)

class ProductGroupViewSet(viewsets.ModelViewSet):
    queryset = ProductGroup.objects.all()
    serializer_class = ProductGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class AssociateProductsView(generics.GenericAPIView):    
    queryset = ProductGroup.objects.all()
    serializer_class = ProductGroupSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        group_name = request.data.get('group_name')
        associated_product_ids = request.data.get('associated_products', [])
        
        if not group_name:
            return Response({'error': 'Group name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a new ProductGroup
        product_group = ProductGroup.objects.create(group_name=group_name)
        
        # Associate products with the new group
        Store.objects.filter(item_id__in=associated_product_ids).update(product_group=product_group)
        
        return Response({'success': 'Products successfully associated.', 'group_id': product_group.group_id}, status=status.HTTP_200_OK)

    
class AssociateProductsUpdate(generics.UpdateAPIView):    
    queryset = ProductGroup.objects.all()
    serializer_class = ProductGroupSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        group_name = request.data.get('group_name')
        associated_product_ids = request.data.get('associated_products', [])
        
        if not group_name:
            return Response({'error': 'Group name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product_group = ProductGroup.objects.get(pk=pk)
        except ProductGroup.DoesNotExist:
            return Response({'error': 'Product group not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Update the group name
        product_group.group_name = group_name
        product_group.save()

        # Update product associations
        Store.objects.filter(item_id__in=associated_product_ids).update(product_group=product_group)
        
        return Response({'success': 'Products successfully updated.'}, status=status.HTTP_200_OK)


class AssociateProductsDelete(generics.UpdateAPIView):    
    queryset = ProductGroup.objects.all()
    serializer_class = ProductGroupSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        group_id = request.data.get('group_id')
        associated_product_ids = request.data.get('product_group', [])
        if not group_id or not associated_product_ids:
            return Response({'error': 'Group ID and product IDs are required for disassociation.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product_group = ProductGroup.objects.get(pk=group_id)
        except ProductGroup.DoesNotExist:
            return Response({'error': 'Product group not found.'}, status=status.HTTP_404_NOT_FOUND)
        Store.objects.filter(item_id__in=associated_product_ids, product_group=product_group).update(product_group=None)
        return Response({'success': 'Products successfully disassociated.'}, status=status.HTTP_200_OK)
