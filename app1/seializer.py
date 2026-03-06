
from app1.models import Employee
from rest_framework import serializers

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
    
    def to_internal_value(self, data):
        # Convert empty strings to None for optional fields
        for field_name in ['address', 'mobile_no', 'age', 'department', 'salary']:
            if field_name in data and data[field_name] == '':
                data[field_name] = None
        return super().to_internal_value(data)

