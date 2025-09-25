from rest_framework import serializers
from .models import User_Login_Info, User_Work_Info, Expense, Income

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

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('serial_number',)  

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'
        read_only_fields = ('serial_number',)
