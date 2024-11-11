from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from api.models import *

class MemberSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}  # Hides the password in forms
    )

    class Meta:
        model = Member
        fields = ['id','username', 'passowrd', 'email', 'membership_tier', 'user_role','cashback', 'cashback_expiry']
        extra_kwargs = {"password": {"read_only": True}}

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