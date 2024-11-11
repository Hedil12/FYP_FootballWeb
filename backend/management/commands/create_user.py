from django.core.management.base import BaseCommand
from backend.api.models import Member

class Command(BaseCommand):
    help = 'Create a new user'

    def add_arguments(self, parser):
        parser.add_argument('--username', required=True, help="User's name")
        parser.add_argument('--email', required=True, help="User's email")
        parser.add_argument('--password', required=True, help="User's password")
        parser.add_argument('--membership_tier', default='Bronze', help="Membership tier")
        parser.add_argument('--user_role', default='User', help="User role")

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        membership_tier = options['membership_tier']
        user_role = options['user_role']

        # Create the user
        user = Member.objects.create_user(
            username=username,
            email=email,
            password=password,
            membership_tier=membership_tier,
            user_role=user_role
        )
        user.save()

        self.stdout.write(self.style.SUCCESS(f"{username} from {email} has created successfully."))
