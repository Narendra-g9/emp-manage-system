from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Employee
from .seializer import EmployeeSerializer

@method_decorator(csrf_exempt, name='dispatch')
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.filter(deleted_at__isnull=True)  # Exclude soft-deleted by default
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'is_active', 'age']
    search_fields = ['name', 'eid', 'mobile_no']
    ordering_fields = ['eid', 'name', 'salary', 'age']
    ordering = ['eid']
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to perform soft delete"""
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """Get all soft-deleted employees"""
        employees = Employee.objects.filter(deleted_at__isnull=False)
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted employee"""
        # Get the employee directly from DB, bypassing the default queryset filter
        try:
            employee = Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        
        employee.restore()
        serializer = self.get_serializer(employee)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_department(self, request):
        """Get employees by department"""
        department = request.query_params.get('department', None)
        if department:
            employees = Employee.objects.filter(department=department, deleted_at__isnull=True)
            serializer = self.get_serializer(employees, many=True)
            return Response(serializer.data)
        return Response({'error': 'Department parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def by_status(self, request, pk=None):
        """Get employee status"""
        employee = self.get_object()
        return Response({'eid': employee.eid, 'name': employee.name, 'is_active': employee.is_active})
