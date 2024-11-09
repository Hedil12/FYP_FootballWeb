# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import ListAPIView
from rest_framework import generics
from .serializers import *
from .models import *
from rest_framework import viewsets

class MemberProfileView(APIView):
    serializer = MemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        Member = self.request.Member
        return MemberSerializer.objects.filter(Member)

class CreateMemberView(generics.CreateAPIView):
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]
    queryset = Member.objects.all()

class ProductListView(ListAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer

class IncentiveListView(ListAPIView):
    queryset = Incentive.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = IncentiveSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer