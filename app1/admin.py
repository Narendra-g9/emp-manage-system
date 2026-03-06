from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('eid', 'name', 'department', 'mobile_no', 'age', 'salary', 'is_active')
    list_filter = ('department', 'is_active')
    search_fields = ('name', 'eid', 'mobile_no')
    ordering = ('eid',)
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('eid', 'name', 'age', 'mobile_no')
        }),
        ('Employment Details', {
            'fields': ('department', 'salary', 'is_active')
        }),
        ('Contact', {
            'fields': ('address',)
        }),
    )
