from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
#from django.contrib.postgres.fields import ArrayField
from cloudinary.models import CloudinaryField
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken

class Membership(models.Model):
    membership_tier = models.BigAutoField(primary_key=True)
    membership_name = models.CharField(max_length=255)
    cashback_rates = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)
    discount_rates = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)

    REQUIRED_FIELDS = ['membership_name', 'cashback_rates', 'discount_rates']

class Role(models.Model):
    role_id = models.BigAutoField(primary_key=True)
    role_type = models.CharField(max_length=255)

    REQUIRED_FIELDS = ['role_type']

class MemberManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field is required")
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        user = self.model(username=username, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_adminuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', False)
        return self.create_user(username, password, **extra_fields)

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)


class Member(AbstractBaseUser, PermissionsMixin):
    member_id = models.BigAutoField(primary_key=True)
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    member_name = models.CharField(max_length=255)
    username = models.CharField(unique=True, max_length=255)
    password = models.CharField(max_length=255)
    member_email = models.EmailField(max_length=255, unique=True)
    cashback_points = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    expiration_date = models.DateField(null=True, blank=True, default=None)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)  # Determines admin access

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['member_name', 'member_email']

    objects = MemberManager()

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
            print('Password Save')
        super().save(*args, **kwargs)

    @property
    def id(self):
        return self.member_id

    def get_tokens_for_user(user):
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role.role_type  # Assuming `role` is a field in your User model
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class ProductGroup(models.Model):
    group_id = models.BigAutoField(primary_key=True)
    group_name = models.CharField(max_length=255)

    def __str__(self):
        return self.group_name

class Store(models.Model):
    item_id = models.BigAutoField(primary_key=True)
    product_group = models.ForeignKey(ProductGroup, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    item_name = models.CharField(max_length=255)
    size = models.CharField(max_length=10, default="NIL")
    item_desc = models.CharField(max_length=255)
    item_qty = models.BigIntegerField()
    item_price = models.DecimalField(max_digits=8, decimal_places=2)
    discount_rates = models.DecimalField(max_digits=8, decimal_places=2)
    is_available = models.BooleanField(default=True)
    item_img = CloudinaryField('image', blank=True, null=True)

    REQUIRED_FIELDS = ['item_id','item_name', 'item_desc', 'item_qty', 
                       'item_price', 'discount_rates',
                       'is_available', 'item_img']

class CartItems(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='cart_items')
    item = models.ForeignKey(Store, on_delete=models.CASCADE)
    qty = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.member.member_name}'s Cart "

class Cart(models.Model):
    user = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='cart', null=True)
    items = models.ManyToManyField(CartItems)

    def calculate_total(self):
        return sum(item.item.item_price * item.qty for item in self.items.all())



class Event(models.Model):
    EVENT_TYPE_CHOICES = [
        ('club_matches', 'Club matches schedule'),
        ('club_training', 'Club training sessions schedule'),
        ('agm', 'Annual General Meeting'),
        ('trial_selection', 'Trial selection'),
        ('promotion','Promotion'),
    ]
    event_id = models.BigAutoField(primary_key=True)
    event_name = models.CharField(max_length=255)
    event_desc = models.CharField(max_length=255, default="")
    event_types = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    event_date_start = models.DateTimeField()
    event_date_end = models.DateTimeField()
    location = models.CharField(max_length=255, default="")
    is_active = models.BooleanField(default=True)
    event_img = CloudinaryField('image', blank=True, null=True, default='')

    REQUIRED_FIELDS = ['event_id','event_name', 'event_types', 'event_date_start', 'event_date_end', 'event_img']

    def save(self, *args, **kwargs):
        if self.event_date_start and self.event_date_end:
            if self.event_date_end <= self.event_date_start:
                raise ValueError("End date must be after the start date.")
        super().save(*args, **kwargs)

class MemberEvent(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)