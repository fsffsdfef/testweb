"""
Django 管理命令：同步任务到 Celery Beat
"""
from django.core.management.base import BaseCommand
from custom_scheduler.models import CustomPeriodicTask
from custom_scheduler.scheduler import CustomDatabaseScheduler
from celery import current_app


class Command(BaseCommand):
    help = '同步自定义任务到 Celery Beat'

    def handle(self, *args, **options):
        """执行同步"""
        self.stdout.write('开始同步任务...')
        
        # 创建调度器实例
        scheduler = CustomDatabaseScheduler(app=current_app)
        
        # 同步任务
        scheduler.sync()
        
        # 统计信息
        total = CustomPeriodicTask.objects.count()
        enabled = CustomPeriodicTask.objects.filter(enabled=True).count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'同步完成！总任务数: {total}, 已启用: {enabled}'
            )
        )








