from django.core.management.base import BaseCommand
from app1.models import Employee

class Command(BaseCommand):
    help = 'Populate database with 10 sample employees'

    def handle(self, *args, **options):
        employees_data = [
            {
                'eid': 101,
                'name': 'Rajesh Kumar',
                'address': '123 Main Street, Delhi',
                'mobile_no': 9876543210,
                'age': 28,
                'department': 'IT',
                'salary': 50000,
                'status': 'Active'
            },
            {
                'eid': 102,
                'name': 'Priya Singh',
                'address': '456 Oak Avenue, Mumbai',
                'mobile_no': 9876543211,
                'age': 26,
                'department': 'HR',
                'salary': 45000,
                'status': 'Active'
            },
            {
                'eid': 103,
                'name': 'Amit Patel',
                'address': '789 Pine Road, Bangalore',
                'mobile_no': 9876543212,
                'age': 30,
                'department': 'IT',
                'salary': 60000,
                'status': 'Active'
            },
            {
                'eid': 104,
                'name': 'Neha Verma',
                'address': '321 Elm Street, Pune',
                'mobile_no': 9876543213,
                'age': 27,
                'department': 'Finance',
                'salary': 48000,
                'status': 'Active'
            },
            {
                'eid': 105,
                'name': 'Arjun Desai',
                'address': '654 Maple Drive, Chennai',
                'mobile_no': 9876543214,
                'age': 29,
                'department': 'Sales',
                'salary': 55000,
                'status': 'Active'
            },
            {
                'eid': 106,
                'name': 'Sakshi Gupta',
                'address': '987 Birch Lane, Hyderabad',
                'mobile_no': 9876543215,
                'age': 25,
                'department': 'Marketing',
                'salary': 42000,
                'status': 'Active'
            },
            {
                'eid': 107,
                'name': 'Vikram Singh',
                'address': '147 Cedar Street, Ahmedabad',
                'mobile_no': 9876543216,
                'age': 31,
                'department': 'IT',
                'salary': 65000,
                'status': 'Active'
            },
            {
                'eid': 108,
                'name': 'Deepika Nair',
                'address': '258 Spruce Road, Kolkata',
                'mobile_no': 9876543217,
                'age': 28,
                'department': 'HR',
                'salary': 46000,
                'status': 'Active'
            },
            {
                'eid': 109,
                'name': 'Sanjay Khanna',
                'address': '369 Walnut Avenue, Surat',
                'mobile_no': 9876543218,
                'age': 32,
                'department': 'Finance',
                'salary': 52000,
                'status': 'Active'
            },
            {
                'eid': 110,
                'name': 'Divya Sharma',
                'address': '741 Ash Drive, Jaipur',
                'mobile_no': 9876543219,
                'age': 26,
                'department': 'Sales',
                'salary': 50000,
                'status': 'Active'
            }
        ]

        for emp_data in employees_data:
            employee, created = Employee.objects.get_or_create(
                eid=emp_data['eid'],
                defaults=emp_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Created employee: {emp_data['name']} (ID: {emp_data['eid']})")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"⚠ Employee already exists: {emp_data['name']} (ID: {emp_data['eid']})")
                )

        self.stdout.write(self.style.SUCCESS('\n✓ Successfully populated database with employee data!'))
