from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from api.models import *

class MemberSerializer(serializers.ModelSerializer):
    user_role = serializers.ChoiceField(choices=Member.USER_ROLES, default='User')
    membership_tier = serializers.ChoiceField(choices=Member.MEMBERSHIP_TIERS, default='Bronze')
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = Member
        fields = ['id','username', 'password', 'email', 'membership_tier', 'user_role','cashback', 'cashback_expiry']
        extra_kwargs = {"password": {"read_only": True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Member.objects.create_user(password=password, **validated_data)
        return user

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'stock', 'discount']

class IncentiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incentive
        fields = ['membership_tier', 'discount_rate', 'cashback_rate']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'event_type', 'date', 'description']