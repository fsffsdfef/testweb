"""
Django 信号处理
用于监听任务执行结果并更新统计信息
"""
from django.dispatch import receiver
from celery.signals import task_success, task_failure
from .scheduler import TaskResultHandler


@receiver(task_success)
def task_success_handler(sender=None, result=None, **kwargs):
    """任务成功信号处理"""
    task_name = sender.name if sender else None
    if task_name:
        TaskResultHandler.handle_success(task_name, result)


@receiver(task_failure)
def task_failure_handler(sender=None, task_id=None, exception=None, traceback=None, **kwargs):
    """任务失败信号处理"""
    task_name = sender.name if sender else None
    if task_name:
        error_msg = str(exception) if exception else None
        traceback_str = str(traceback) if traceback else None
        TaskResultHandler.handle_failure(task_name, error_msg, traceback_str)








