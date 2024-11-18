from rest_framework import serializers
from .models import Membership, Role, Member, Store, Cart, Event, MemberEvent

class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    user_role = serializers.CharField(default='User')
    membership_tier = serializers.CharField(default='Bronze')
    
    class Meta:
        model = Member
        fields = ['id', 'username', 'password', 'email', 'membership_tier', 'user_role', 'cashback', 'cashback_expiry']
        extra_kwargs = {'password': {'write_only': True}}

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
    member = MemberSerializer()
    item = StoreSerializer()

    class Meta:
        model = Cart
        fields = '__all__'

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
