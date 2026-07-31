"""
自定义 Celery Beat 数据表模型
继承 django_celery_beat 的模型，扩展自定义字段和功能
"""
from django.db import models
from django_celery_beat.models import (
    PeriodicTask,
    IntervalSchedule,
    CrontabSchedule,
    SolarSchedule,
    ClockedSchedule,
    PeriodicTasks,
)
from django.utils import timezone


class CustomIntervalSchedule(IntervalSchedule):
    """自定义间隔调度表"""
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='描述',
        help_text='调度任务的描述信息'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )

    class Meta:
        db_table = 'custom_interval_schedule'
        verbose_name = '自定义间隔调度'
        verbose_name_plural = '自定义间隔调度'


class CustomCrontabSchedule(CrontabSchedule):
    """自定义 Crontab 调度表"""
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='描述',
        help_text='调度任务的描述信息'
    )
    timezone = models.CharField(
        max_length=63,
        default='Asia/Shanghai',
        verbose_name='时区',
        help_text='调度时区'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )

    class Meta:
        db_table = 'custom_crontab_schedule'
        verbose_name = '自定义 Crontab 调度'
        verbose_name_plural = '自定义 Crontab 调度'


class CustomPeriodicTask(PeriodicTask):
    """自定义周期性任务表"""
    # 扩展字段
    task_type = models.CharField(
        max_length=50,
        default='default',
        choices=[
            ('default', '默认任务'),
            ('data_sync', '数据同步'),
            ('report', '报表生成'),
            ('cleanup', '清理任务'),
            ('notification', '通知任务'),
        ],
        verbose_name='任务类型'
    )
    
    priority = models.IntegerField(
        default=5,
        choices=[(i, i) for i in range(1, 11)],
        verbose_name='优先级',
        help_text='1-10，数字越大优先级越高'
    )
    
    retry_count = models.IntegerField(
        default=0,
        verbose_name='重试次数'
    )
    
    max_retries = models.IntegerField(
        default=3,
        verbose_name='最大重试次数'
    )
    
    last_run_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='最后运行时间'
    )
    
    next_run_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='下次运行时间'
    )
    
    run_count = models.IntegerField(
        default=0,
        verbose_name='运行次数'
    )
    
    success_count = models.IntegerField(
        default=0,
        verbose_name='成功次数'
    )
    
    failure_count = models.IntegerField(
        default=0,
        verbose_name='失败次数'
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        verbose_name='错误信息'
    )
    
    created_by = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='创建人'
    )
    
    updated_by = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='更新人'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )
    
    # 关联自定义调度表
    custom_interval = models.ForeignKey(
        CustomIntervalSchedule,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='periodic_tasks',
        verbose_name='自定义间隔调度'
    )
    
    custom_crontab = models.ForeignKey(
        CustomCrontabSchedule,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='periodic_tasks',
        verbose_name='自定义 Crontab 调度'
    )

    class Meta:
        db_table = 'custom_periodic_task'
        verbose_name = '自定义周期性任务'
        verbose_name_plural = '自定义周期性任务'
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['task_type', 'enabled']),
            models.Index(fields=['priority', 'enabled']),
            models.Index(fields=['next_run_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.task_type})"

    @property
    def schedule(self):
        """
        重写 schedule 属性，支持自定义调度字段
        优先使用标准调度类型，如果没有则使用自定义调度类型
        """
        # 优先检查标准调度类型
        if self.interval:
            return self.interval.schedule
        elif self.crontab:
            return self.crontab.schedule
        elif self.solar:
            return self.solar.schedule
        elif self.clocked:
            return self.clocked.schedule
        
        # 检查自定义调度类型
        if self.custom_interval:
            return self.custom_interval.schedule
        elif self.custom_crontab:
            # 自定义 Crontab 需要转换为 Celery 的 crontab schedule
            from django_celery_beat.schedulers import crontab
            return crontab(
                minute=self.custom_crontab.minute,
                hour=self.custom_crontab.hour,
                day_of_week=self.custom_crontab.day_of_week,
                day_of_month=self.custom_crontab.day_of_month,
                month_of_year=self.custom_crontab.month_of_year,
            )
        elif hasattr(self, 'custom_solar') and self.custom_solar:
            return self.custom_solar.schedule
        elif hasattr(self, 'custom_clocked') and self.custom_clocked:
            return self.custom_clocked.schedule
        
        # 如果没有找到任何调度器，返回 None
        # 这会导致 AttributeError，但这是预期的行为，表示任务配置错误
        return None

    @property
    def scheduler(self):
        """
        重写 scheduler 属性，返回当前使用的调度器对象
        这个属性被父类的 schedule 属性使用
        """
        # 优先检查标准调度类型
        if self.interval:
            return self.interval
        elif self.crontab:
            return self.crontab
        elif self.solar:
            return self.solar
        elif self.clocked:
            return self.clocked
        
        # 检查自定义调度类型
        if self.custom_interval:
            return self.custom_interval
        elif self.custom_crontab:
            return self.custom_crontab
        elif hasattr(self, 'custom_solar') and self.custom_solar:
            return self.custom_solar
        elif hasattr(self, 'custom_clocked') and self.custom_clocked:
            return self.custom_clocked
        
        return None

    def update_next_run_time(self):
        """更新下次运行时间"""
        if self.interval:
            self.next_run_at = timezone.now() + self.interval.period
        elif self.crontab:
            # 计算下次 crontab 执行时间
            from django_celery_beat.schedulers import crontab
            schedule = crontab(
                minute=self.crontab.minute,
                hour=self.crontab.hour,
                day_of_week=self.crontab.day_of_week,
                day_of_month=self.crontab.day_of_month,
                month_of_year=self.crontab.month_of_year,
            )
            self.next_run_at = schedule.next_run(timezone.now())
        elif self.custom_interval:
            self.next_run_at = timezone.now() + self.custom_interval.period
        elif self.custom_crontab:
            from django_celery_beat.schedulers import crontab
            schedule = crontab(
                minute=self.custom_crontab.minute,
                hour=self.custom_crontab.hour,
                day_of_week=self.custom_crontab.day_of_week,
                day_of_month=self.custom_crontab.day_of_month,
                month_of_year=self.custom_crontab.month_of_year,
            )
            self.next_run_at = schedule.next_run(timezone.now())
        self.save(update_fields=['next_run_at'])

    def record_success(self):
        """记录成功执行"""
        self.run_count += 1
        self.success_count += 1
        self.last_run_at = timezone.now()
        self.error_message = None
        self.update_next_run_time()
        self.save(update_fields=['run_count', 'success_count', 'last_run_at', 'error_message', 'next_run_at'])

    def record_failure(self, error_msg=None):
        """记录失败执行"""
        self.run_count += 1
        self.failure_count += 1
        self.last_run_at = timezone.now()
        if error_msg:
            self.error_message = error_msg
        if self.retry_count < self.max_retries:
            self.retry_count += 1
        self.save(update_fields=['run_count', 'failure_count', 'last_run_at', 'error_message', 'retry_count'])


class TaskExecutionLog(models.Model):
    """任务执行日志表"""
    task = models.ForeignKey(
        CustomPeriodicTask,
        on_delete=models.CASCADE,
        related_name='execution_logs',
        verbose_name='任务'
    )
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', '等待中'),
            ('running', '运行中'),
            ('success', '成功'),
            ('failure', '失败'),
            ('retry', '重试中'),
        ],
        default='pending',
        verbose_name='状态'
    )
    
    started_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='开始时间'
    )
    
    finished_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='结束时间'
    )
    
    duration = models.FloatField(
        null=True,
        blank=True,
        verbose_name='执行时长（秒）'
    )
    
    result = models.TextField(
        blank=True,
        null=True,
        verbose_name='执行结果'
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        verbose_name='错误信息'
    )
    
    traceback = models.TextField(
        blank=True,
        null=True,
        verbose_name='错误堆栈'
    )

    class Meta:
        db_table = 'task_execution_log'
        verbose_name = '任务执行日志'
        verbose_name_plural = '任务执行日志'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['task', 'status']),
            models.Index(fields=['started_at']),
        ]

    def __str__(self):
        return f"{self.task.name} - {self.status} - {self.started_at}"

    def finish(self, status='success', result=None, error_message=None, traceback=None):
        """完成执行记录"""
        self.finished_at = timezone.now()
        self.status = status
        if self.started_at:
            self.duration = (self.finished_at - self.started_at).total_seconds()
        if result:
            self.result = str(result)
        if error_message:
            self.error_message = error_message
        if traceback:
            self.traceback = traceback
        self.save()







