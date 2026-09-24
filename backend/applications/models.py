from django.db import models
from django.contrib.auth.models import User


class StudentProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )

    phone_number = models.CharField(
        max_length=15,
        unique=True
    )

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Application(models.Model):

    STATUS_CHOICES = [
        ("APPLIED", "Applied"),
        ("SHORTLISTED", "Shortlisted"),
        ("TEST", "Test"),
        ("GD", "Group Discussion"),
        ("TECHNICAL", "Technical Interview"),
        ("HR", "HR Interview"),
        ("OFFER", "Offer"),
        ("REJECTED", "Rejected"),
    ]

    PRIORITY_CHOICES = [
        ("HIGH", "High"),
        ("MEDIUM", "Medium"),
        ("LOW", "Low"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="applications",
        null=True,
        blank=True,
    )

    company = models.CharField(
        max_length=100
    )

    role = models.CharField(
        max_length=100
    )

    location = models.CharField(
        max_length=100,
        blank=True
    )

    ctc = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="APPLIED"
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="MEDIUM"
    )

    applied_date = models.DateField()

    next_event_date = models.DateTimeField(
        null=True,
        blank=True
    )

    notes = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.company} - {self.role}"


class PreparationTask(models.Model):

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="preparation_tasks"
    )

    topic = models.CharField(
        max_length=100
    )

    completed = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.application.company} - "
            f"{self.topic}"
        )
    