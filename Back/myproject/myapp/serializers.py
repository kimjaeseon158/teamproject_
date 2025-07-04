# serializers.py
from rest_framework import serializers
from .models import Item, User_Login_Info, Work_Info

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Item
        fields = '__all__' 
        
class User_Login_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User_Login_Info
        fields = '__all__'
        
class Work_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Work_Info
        fields = '__all__'

class User_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Login_Info
        exclude = ('user_id', 'password')
