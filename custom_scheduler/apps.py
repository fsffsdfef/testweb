"""
Django App 配置
"""
from django.apps import AppConfig


class CustomSchedulerConfig(AppConfig):
    """自定义调度器应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'custom_scheduler'
    verbose_name = '自定义任务调度器'
    
    def ready(self):
        """应用就绪时执行"""
        # 导入信号处理器
        import custom_scheduler.signals  # noqa








