# backend/app/core/admin.py
"""
Admin configuration for the core app.
This module customizes how models are displayed in the Django admin interface.
"""

from django.contrib import admin

# Register your models here.
# Example:
# from .models import YourModel
# 
# @admin.register(YourModel)
# class YourModelAdmin(admin.ModelAdmin):
#     list_display = ('field1', 'field2')
#     search_fields = ('field1',)

# Import textile admin configurations
from .textile_admin import *