"""
Celery 配置
配置使用自定义调度器
"""
import os
from celery import Celery
from django.conf import settings

# 设置 Django 配置模块
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')

app = Celery('your_project')

# 从 Django 设置中加载配置
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现任务
app.autodiscover_tasks()

# 使用自定义调度器
app.conf.beat_scheduler = 'custom_scheduler.scheduler:CustomDatabaseScheduler'

# Celery Beat 配置
app.conf.beat_schedule = {}

# 时区配置
app.conf.timezone = 'Asia/Shanghai'
app.conf.enable_utc = True








