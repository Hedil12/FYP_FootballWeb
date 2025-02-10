from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from cloudinary.forms import CloudinaryFileField

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        # Validate and generate a new access token
        data = super().validate(attrs)

        # Get the user associated with the refresh token
        refresh_token = RefreshToken(attrs['refresh'])
        user = Member.objects.get(member_id=refresh_token['user_id'])

        # Add additional user information to the response
        data['member_name'] = user.member_name
        data['email'] = user.member_email
        data['role'] = user.role.role_type if user.role else None
        return data


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['member_id'] = user.member_id
        data['username'] = user.username
        data['member_name'] = user.member_name
        data['email'] = user.member_email
        data['role'] = user.role.role_type if user.role else None
        return data

class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    membership = serializers.PrimaryKeyRelatedField(queryset=Membership.objects.all())
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    class Meta:
        model = Member
        fields = ['member_id', 'username', 'member_name','member_email', 'password', 'membership', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        # Ensure role exist
        if 'role' not in data:
            raise serializers.ValidationError("Role is required.")
        return data

    def create(self, validated_data):
        # Set default values for role and membership if not provided
        role = validated_data.get('role', Role.objects.get(role_id=1))
        membership = validated_data.get('membership', Membership.objects.get(membership_tier=1))

        # Create member instance with role and membership
        validated_data['role'] = role
        validated_data['membership'] = membership

        password = validated_data.pop('password', None)
        member = Member(**validated_data)
        if password:
            member.set_password(password)
        member.save()
        return member

class ProductGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductGroup
        fields = '__all__'

class StoreSerializer(serializers.ModelSerializer):
    item_img = CloudinaryFileField()
    product_group = serializers.PrimaryKeyRelatedField(queryset=ProductGroup.objects.all(), required=False)

    class Meta:
        model = Store
        fields = ['item_id', 'product_group', 'item_name', 'size', 'item_desc', 
                  'item_qty', 'item_price', 'discount_rates',
                  'is_available', 'item_img']

    def create(self, validated_data):
        store = Store.objects.create(**validated_data)
        return store
    
class CartItemSerializer(serializers.ModelSerializer):
    item = StoreSerializer()  # Nest the Store serializer to include item details

    class Meta:
        model = CartItems
        fields = ['id', 'item', 'qty']

    def calculate_total(self):
        total_price = sum(
            item['item']['item_price'] * item['qty'] 
            for item in self.data['cart_items']
        )
        return total_price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)  # Include cart items with detailed info

    class Meta:
        model = Cart
        fields = ['user', 'cart_items']

    def calculate_total(self):
        # Add a total price field to the serializer for easier response formatting
        total_price = sum(
            item['item']['item_price'] * item['qty'] 
            for item in self.data['items']
        )
        return total_price


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        

    def validate(self, data):
        # Validate dates
        if data['event_date_end'] <= data['event_date_start']:
            raise serializers.ValidationError({
                'event_date_end': "End date must be after the start date."
            })

        # Validate event type
        if data['event_types'] not in dict(Event.EVENT_TYPE_CHOICES):
            raise serializers.ValidationError({
                'event_types': "Invalid event type."
            })

        return data

class MemberEventSerializer(serializers.ModelSerializer):
    member = MemberSerializer()
    event = EventSerializer()

    class Meta:
        model = MemberEvent
        fields = '__all__'