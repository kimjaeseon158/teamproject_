from rest_framework import serializers
from .models import User_Login_Info, User_Work_Info

class User_Login_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User_Login_Info
        fields = '__all__'
        
class User_Work_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User_Work_Info
        fields = '__all__'

class User_InfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Login_Info
        exclude = ('user_id', 'password')
