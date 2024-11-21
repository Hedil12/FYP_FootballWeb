from rest_framework import serializers
from .models import Membership, Role, Member, Store, Cart, Event, MemberEvent
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        # Validate and generate a new access token
        data = super().validate(attrs)

        # Get the user associated with the refresh token
        refresh_token = RefreshToken(attrs['refresh'])
        user = Member.objects.get(id=refresh_token['user_id'])

        # Add additional user information to the response
        data['member_name'] = user.member_name
        data['email'] = user.member_email
        data['role'] = user.role.role_type
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

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        member = Member(**validated_data)
        if password:
            member.set_password(password)
        member.save()
        return member

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = '__all__'

    def create(self, validated_data):
        member_data = validated_data.pop('member')
        item_data = validated_data.pop('item')
        member = Member.objects.get(**member_data)  # Adjust as necessary
        item = Store.objects.get(**item_data)  # Adjust as necessary
        cart = Cart(member=member, item=item, **validated_data)
        cart.save()
        return cart

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class MemberEventSerializer(serializers.ModelSerializer):
    member = MemberSerializer()
    event = EventSerializer()

    class Meta:
        model = MemberEvent
        fields = '__all__'
