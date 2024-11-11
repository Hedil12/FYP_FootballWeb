from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

class MemberManager(BaseUserManager):
    def create_user(self, email, password=None, username=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class Member(AbstractBaseUser):
    MEMBERSHIP_TIERS = [
        ('Gold', 'Gold'),
        ('Silver', 'Silver'),
        ('Bronze', 'Bronze'),
        ('Admin', 'Admin')
    ]
    USER_ROLES = [
        ('Admin', 'Admin'),
        ('User', 'User')
    ]
    email = models.EmailField(unique=True,blank=False)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    membership_tier = models.CharField(max_length=10, choices=MEMBERSHIP_TIERS, default='Bronze')
    user_role = models.CharField(max_length=10, choices=USER_ROLES, default='User')
    cashback = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    cashback_expiry = models.DateField(null=True, blank=True)

    objects = MemberManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username
    
class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    discount = models.DecimalField(null=True, blank=True, max_digits=8, decimal_places=2)

    def __str__(self):
        return self.name

class Incentive(models.Model):
    MEMBERSHIP_TIERS = [
        ('Gold', 'Gold'),
        ('Silver', 'Silver'),
        ('Bronze', 'Bronze'),
    ]
    membership_tier = models.CharField(max_length=10, choices=MEMBERSHIP_TIERS)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2)
    cashback_rate = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.membership_tier} Incentive"


class Event(models.Model):
    EVENT_TYPES = [
        ('Match', 'Match'),
        ('Training', 'Training'),
        ('AGM', 'AGM'),
        ('Trial', 'Trial'),
    ]
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    date = models.DateField()
    description = models.TextField()

    def __str__(self):
        return f"{self.event_type} on {self.date}"