# models.py
from django.db import models
from django.utils import timezone

class Employee(models.Model):
    eid=models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    address=models.TextField(max_length=400, null=True, blank=True)
    mobile_no=models.BigIntegerField(unique=True, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    salary = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)  # Soft delete field
    
    def soft_delete(self):
        """Mark employee as deleted (soft delete)"""
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save()
    
    def restore(self):
        """Restore a soft-deleted employee"""
        self.deleted_at = None
        self.is_active = True
        self.save()


