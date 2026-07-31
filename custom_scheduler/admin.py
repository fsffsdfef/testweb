"""
Django Admin 配置
用于在 Django Admin 后台管理自定义任务
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    CustomIntervalSchedule,
    CustomCrontabSchedule,
    CustomPeriodicTask,
    TaskExecutionLog,
)


@admin.register(CustomIntervalSchedule)
class CustomIntervalScheduleAdmin(admin.ModelAdmin):
    """自定义间隔调度管理"""
    list_display = ['id', 'every', 'period', 'description', 'created_at']
    list_filter = ['period', 'created_at']
    search_fields = ['description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CustomCrontabSchedule)
class CustomCrontabScheduleAdmin(admin.ModelAdmin):
    """自定义 Crontab 调度管理"""
    list_display = ['id', 'minute', 'hour', 'day_of_week', 'day_of_month', 
                   'month_of_year', 'timezone', 'description', 'created_at']
    list_filter = ['timezone', 'created_at']
    search_fields = ['description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CustomPeriodicTask)
class CustomPeriodicTaskAdmin(admin.ModelAdmin):
    """自定义周期性任务管理"""
    list_display = [
        'name', 'task_type', 'task', 'enabled', 'priority', 
        'run_count', 'success_count', 'failure_count',
        'last_run_at', 'next_run_at', 'created_at'
    ]
    list_filter = [
        'task_type', 'enabled', 'priority', 'created_at'
    ]
    search_fields = ['name', 'task', 'description']
    readonly_fields = [
        'run_count', 'success_count', 'failure_count',
        'last_run_at', 'next_run_at', 'created_at', 'updated_at',
        'execution_logs_link'
    ]
    
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'task', 'task_type', 'description', 'enabled')
        }),
        ('调度设置', {
            'fields': ('interval', 'crontab', 'solar', 'clocked',
                      'custom_interval', 'custom_crontab')
        }),
        ('任务参数', {
            'fields': ('args', 'kwargs', 'options')
        }),
        ('优先级和重试', {
            'fields': ('priority', 'max_retries', 'retry_count')
        }),
        ('统计信息', {
            'fields': ('run_count', 'success_count', 'failure_count',
                      'last_run_at', 'next_run_at', 'error_message')
        }),
        ('执行日志', {
            'fields': ('execution_logs_link',)
        }),
        ('其他信息', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at')
        }),
    )
    
    def execution_logs_link(self, obj):
        """执行日志链接"""
        if obj.pk:
            url = reverse('admin:custom_scheduler_taskexecutionlog_changelist')
            return format_html(
                '<a href="{}?task__id__exact={}">查看执行日志 ({} 条)</a>',
                url, obj.pk, obj.execution_logs.count()
            )
        return '-'
    execution_logs_link.short_description = '执行日志'
    
    actions = ['enable_tasks', 'disable_tasks', 'reset_statistics']
    
    def enable_tasks(self, request, queryset):
        """启用任务"""
        count = queryset.update(enabled=True)
        self.message_user(request, f'已启用 {count} 个任务')
    enable_tasks.short_description = '启用选中的任务'
    
    def disable_tasks(self, request, queryset):
        """禁用任务"""
        count = queryset.update(enabled=False)
        self.message_user(request, f'已禁用 {count} 个任务')
    disable_tasks.short_description = '禁用选中的任务'
    
    def reset_statistics(self, request, queryset):
        """重置统计信息"""
        count = queryset.update(
            run_count=0,
            success_count=0,
            failure_count=0,
            retry_count=0,
            error_message=None
        )
        self.message_user(request, f'已重置 {count} 个任务的统计信息')
    reset_statistics.short_description = '重置选中任务的统计信息'


@admin.register(TaskExecutionLog)
class TaskExecutionLogAdmin(admin.ModelAdmin):
    """任务执行日志管理"""
    list_display = [
        'task', 'status', 'started_at', 'finished_at', 
        'duration', 'has_error'
    ]
    list_filter = ['status', 'started_at', 'task']
    search_fields = ['task__name', 'error_message']
    readonly_fields = [
        'task', 'status', 'started_at', 'finished_at',
        'duration', 'result', 'error_message', 'traceback'
    ]
    
    def has_error(self, obj):
        """是否有错误"""
        return bool(obj.error_message)
    has_error.boolean = True
    has_error.short_description = '有错误'
    
    def has_add_permission(self, request):
        """禁止手动添加日志"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """禁止修改日志"""
        return False








