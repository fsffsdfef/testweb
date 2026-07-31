# Django 集成 Celery Beat 自定义数据模型和调度器完整指南

## 一、概述

本指南将详细介绍如何在 Django 项目中集成 Celery Beat，并自定义数据模型和调度器，实现更灵活的任务调度管理。

## 二、安装依赖

```bash
pip install celery django-celery-beat redis
```

**依赖说明：**
- `celery`: Celery 核心库
- `django-celery-beat`: Django 与 Celery Beat 的集成库
- `redis`: 消息代理（也可以使用 RabbitMQ）

## 三、项目结构

```
your_project/
├── your_project/
│   ├── __init__.py
│   ├── settings.py
│   ├── celery.py          # Celery 应用配置
│   └── urls.py
├── custom_scheduler/      # 自定义调度器应用
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py          # 自定义数据模型
│   ├── scheduler.py       # 自定义调度器
│   ├── admin.py           # Django Admin 配置（可选）
│   └── migrations/
└── manage.py
```

## 四、实现步骤

### 步骤 1: 创建 Django App

```bash
python manage.py startapp custom_scheduler
```

### 步骤 2: 定义自定义数据模型

在 `custom_scheduler/models.py` 中定义自定义模型：

```python
"""
自定义 Celery Beat 数据表模型
继承 django_celery_beat 的模型，扩展自定义字段和功能
"""
from django.db import models
from django.utils import timezone
from django_celery_beat.models import (
    PeriodicTask,
    IntervalSchedule,
    CrontabSchedule,
    SolarSchedule,
    ClockedSchedule,
)


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
    custom_timezone = models.CharField(
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
    
    # 关联自定义调度表
    customInterval = models.ForeignKey(
        CustomIntervalSchedule,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='periodic_tasks',
        verbose_name='自定义间隔调度'
    )
    
    customCrontab = models.ForeignKey(
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

    def update_next_run_time(self):
        """更新下次运行时间"""
        if self.interval:
            self.next_run_at = timezone.now() + self.interval.period
        elif self.crontab:
            from django_celery_beat.schedulers import crontab
            schedule = crontab(
                minute=self.crontab.minute,
                hour=self.crontab.hour,
                day_of_week=self.crontab.day_of_week,
                day_of_month=self.crontab.day_of_month,
                month_of_year=self.crontab.month_of_year,
            )
            self.next_run_at = schedule.next_run(timezone.now())
        elif self.customInterval:
            self.next_run_at = timezone.now() + self.customInterval.period
        elif self.customCrontab:
            from django_celery_beat.schedulers import crontab
            schedule = crontab(
                minute=self.customCrontab.minute,
                hour=self.customCrontab.hour,
                day_of_week=self.customCrontab.day_of_week,
                day_of_month=self.customCrontab.day_of_month,
                month_of_year=self.customCrontab.month_of_year,
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
        self.save(update_fields=['run_count', 'failure_count', 'last_run_at', 'error_message'])


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
```

### 步骤 3: 创建自定义调度器

在 `custom_scheduler/scheduler.py` 中创建自定义调度器：

```python
"""
自定义 Celery Beat 调度器
继承 django_celery_beat 的调度器，扩展自定义功能
"""
import json
import logging
from django.utils import timezone
from django_celery_beat.schedulers import DatabaseScheduler
from django_celery_beat.models import PeriodicTask
from celery.schedules import crontab
from .models import CustomPeriodicTask, TaskExecutionLog

logger = logging.getLogger(__name__)


class CustomDatabaseScheduler(DatabaseScheduler):
    """
    自定义数据库调度器
    扩展了任务执行日志、错误处理、重试机制等功能
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._last_update_time = None
        self._update_interval = 60  # 每60秒更新一次，避免频繁查询数据库

    def setup_schedule(self):
        """设置调度计划"""
        try:
            super().setup_schedule()
            # 初始化自定义任务
            self._sync_custom_tasks()
        except Exception as e:
            logger.error(f"Error in setup_schedule: {e}", exc_info=True)
            raise

    def _sync_custom_tasks(self):
        """同步自定义任务到 Celery Beat"""
        try:
            for task in CustomPeriodicTask.objects.filter(enabled=True):
                try:
                    self._add_custom_task(task)
                except Exception as e:
                    logger.error(f"Error syncing task {task.name}: {e}", exc_info=True)
        except Exception as e:
            logger.error(f"Error in _sync_custom_tasks: {e}", exc_info=True)

    def _add_custom_task(self, task):
        """添加自定义任务到调度器"""
        try:
            schedule_obj = self._get_task_schedule(task)
            if schedule_obj:
                self.app.conf.beat_schedule[task.name] = {
                    'task': task.task,
                    'schedule': schedule_obj,
                    'args': json.loads(task.args) if task.args else (),
                    'kwargs': json.loads(task.kwargs) if task.kwargs else {},
                    'options': json.loads(task.options) if task.options else {},
                }
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error for task {task.name}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error adding task {task.name}: {e}", exc_info=True)
            raise

    @staticmethod
    def _get_task_schedule(task):
        """获取任务调度对象"""
        try:
            # 优先检查标准调度类型
            if task.interval:
                return task.interval.schedule
            elif task.crontab:
                return task.crontab.schedule
            elif task.solar:
                return task.solar.schedule
            elif task.clocked:
                return task.clocked.schedule
            
            # 检查自定义调度类型
            if hasattr(task, 'customInterval') and task.customInterval:
                return task.customInterval.schedule
            elif hasattr(task, 'customCrontab') and task.customCrontab:
                return crontab(
                    minute=task.customCrontab.minute,
                    hour=task.customCrontab.hour,
                    day_of_week=task.customCrontab.day_of_week,
                    day_of_month=task.customCrontab.day_of_month,
                    month_of_year=task.customCrontab.month_of_year,
                )
            elif hasattr(task, 'customSolar') and task.customSolar:
                return task.customSolar.schedule
            elif hasattr(task, 'customClocked') and task.customClocked:
                return task.customClocked.schedule
            
            return None
        except AttributeError as e:
            logger.warning(f"Attribute error getting schedule for task {getattr(task, 'name', 'unknown')}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error getting schedule for task {getattr(task, 'name', 'unknown')}: {e}", exc_info=True)
            return None

    def sync(self):
        """同步任务到数据库"""
        try:
            super().sync()
            self._sync_custom_tasks()
        except Exception as e:
            logger.error(f"Error in sync: {e}", exc_info=True)
            raise

    def apply_async(self, entry, producer=None, advance=True, **kwargs):
        """异步执行任务，并记录执行日志"""
        log = None
        custom_task = None
        
        if isinstance(entry, dict) and 'task' in entry:
            task_name = entry['task']
            try:
                custom_task = CustomPeriodicTask.objects.get(task=task_name, enabled=True)
                log = TaskExecutionLog.objects.create(
                    task=custom_task,
                    status='pending'
                )
            except CustomPeriodicTask.DoesNotExist:
                pass
            except Exception as e:
                logger.warning(f"Error creating log for task {task_name}: {e}")

        try:
            result = super().apply_async(entry, producer=producer, advance=advance, **kwargs)
            
            if log:
                try:
                    log.status = 'running'
                    log.save(update_fields=['status'])
                except Exception as e:
                    logger.warning(f"Error updating log status: {e}")

            return result
        except Exception as e:
            if log:
                try:
                    log.finish(
                        status='failure',
                        error_message=str(e),
                        traceback=str(e.__traceback__) if hasattr(e, '__traceback__') else None
                    )
                except Exception as log_error:
                    logger.warning(f"Error finishing log: {log_error}")
            
            if custom_task and hasattr(custom_task, 'record_failure'):
                try:
                    custom_task.record_failure(str(e))
                except Exception as record_error:
                    logger.warning(f"Error recording failure: {record_error}")
            
            raise

    def tick(self, event_t=None, min=min, **kwargs):
        """每次调度周期执行"""
        try:
            now = timezone.now()
            if (self._last_update_time is None or 
                (now - self._last_update_time).total_seconds() >= self._update_interval):
                self._update_next_run_times()
                self._last_update_time = now
            
            return super().tick(event_t=event_t, min=min, **kwargs)
        except Exception as e:
            logger.error(f"Error in tick: {e}", exc_info=True)
            return super().tick(event_t=event_t, min=min, **kwargs)

    def _update_next_run_times(self):
        """更新所有任务的下次执行时间"""
        try:
            now = timezone.now()
            queryset = CustomPeriodicTask.objects.filter(enabled=True)
            
            if hasattr(CustomPeriodicTask, 'next_run_at'):
                queryset = queryset.filter(next_run_at__lte=now)
            
            for task in queryset:
                try:
                    if hasattr(task, 'update_next_run_time'):
                        task.update_next_run_time()
                except Exception as e:
                    logger.warning(f"Error updating next run time for task {task.name}: {e}")
        except Exception as e:
            logger.error(f"Error in _update_next_run_times: {e}", exc_info=True)

    def get_from_database(self):
        """从数据库获取任务"""
        try:
            tasks = super().get_from_database()
            
            for custom_task in CustomPeriodicTask.objects.filter(enabled=True):
                if custom_task.name in tasks:
                    logger.debug(f"Skipping duplicate task name: {custom_task.name}")
                    continue
                
                try:
                    schedule_obj = self._get_task_schedule(custom_task)
                    if schedule_obj:
                        tasks[custom_task.name] = {
                            'task': custom_task.task,
                            'schedule': schedule_obj,
                            'args': json.loads(custom_task.args) if custom_task.args else (),
                            'kwargs': json.loads(custom_task.kwargs) if custom_task.kwargs else {},
                            'options': json.loads(custom_task.options) if custom_task.options else {},
                        }
                except json.JSONDecodeError as e:
                    logger.error(f"JSON decode error for task {custom_task.name}: {e}")
                    continue
                except Exception as e:
                    logger.error(f"Error processing custom task {custom_task.name}: {e}", exc_info=True)
                    continue
            
            return tasks
        except Exception as e:
            logger.error(f"Error in get_from_database: {e}", exc_info=True)
            return super().get_from_database()
```

### 步骤 4: 配置 Django Settings

在 `your_project/settings.py` 中添加配置：

```python
# 已安装的应用
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Celery Beat
    'django_celery_beat',
    
    # 自定义调度器
    'custom_scheduler',
    
    # 其他应用...
]

# Celery 配置
CELERY_BROKER_URL = 'redis://localhost:6379/0'  # 消息代理
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'  # 结果后端

# Celery Beat 配置
CELERY_BEAT_SCHEDULER = 'custom_scheduler.scheduler:CustomDatabaseScheduler'
CELERY_TIMEZONE = 'Asia/Shanghai'
CELERY_ENABLE_UTC = True

# Celery 任务配置
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_TIME_LIMIT = 30 * 60  # 任务超时时间（秒）
CELERY_TASK_SOFT_TIME_LIMIT = 60  # 任务软超时时间（秒）
```

### 步骤 5: 配置 Celery 应用

在 `your_project/celery.py` 中配置 Celery 应用：

```python
"""
Celery 配置
"""
import os
from celery import Celery

# 设置 Django 配置模块
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')

# 创建 Celery 应用实例
app = Celery('your_project')

# 从 Django 设置中加载配置
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现任务（从所有已安装的应用中）
app.autodiscover_tasks()

# 使用自定义调度器
app.conf.beat_scheduler = 'custom_scheduler.scheduler:CustomDatabaseScheduler'

# Celery Beat 配置
app.conf.beat_schedule = {}

# 时区配置
app.conf.timezone = 'Asia/Shanghai'
app.conf.enable_utc = True
```

在 `your_project/__init__.py` 中导入 Celery 应用：

```python
"""
Django 项目初始化
"""
from .celery import app as celery_app

__all__ = ('celery_app',)
```

### 步骤 6: 配置 App

在 `custom_scheduler/apps.py` 中配置应用：

```python
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
        # 导入信号处理器（如果需要）
        # import custom_scheduler.signals  # noqa
        pass
```

### 步骤 7: 数据库迁移

```bash
# 生成迁移文件
python manage.py makemigrations custom_scheduler

# 执行迁移
python manage.py migrate
```

### 步骤 8: 创建示例任务

在任意应用的 `tasks.py` 中创建任务：

```python
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task
def my_periodic_task(arg1, arg2):
    """示例周期性任务"""
    logger.info(f"执行任务: {arg1}, {arg2}")
    return f"任务完成: {arg1}, {arg2}"


@shared_task
def data_sync_task():
    """数据同步任务"""
    logger.info("开始数据同步...")
    # 执行数据同步逻辑
    return "数据同步完成"
```

### 步骤 9: 启动服务

**启动 Redis（如果使用 Redis）：**
```bash
redis-server
```

**启动 Celery Worker：**
```bash
celery -A your_project worker -l info
```

**启动 Celery Beat：**
```bash
celery -A your_project beat -l info --scheduler custom_scheduler.scheduler:CustomDatabaseScheduler
```

或者使用 `--scheduler` 参数：
```bash
celery -A your_project beat -l info --scheduler custom_scheduler.scheduler:CustomDatabaseScheduler
```

## 五、使用示例

### 1. 通过 Django Admin 创建任务

在 `custom_scheduler/admin.py` 中配置：

```python
from django.contrib import admin
from .models import CustomPeriodicTask, CustomIntervalSchedule, CustomCrontabSchedule, TaskExecutionLog


@admin.register(CustomIntervalSchedule)
class CustomIntervalScheduleAdmin(admin.ModelAdmin):
    list_display = ['every', 'period', 'description', 'created_at']
    list_filter = ['period']


@admin.register(CustomCrontabSchedule)
class CustomCrontabScheduleAdmin(admin.ModelAdmin):
    list_display = ['minute', 'hour', 'day_of_week', 'day_of_month', 'month_of_year', 'description']


@admin.register(CustomPeriodicTask)
class CustomPeriodicTaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'task', 'task_type', 'priority', 'enabled', 'last_run_at', 'next_run_at']
    list_filter = ['task_type', 'enabled', 'priority']
    search_fields = ['name', 'task']


@admin.register(TaskExecutionLog)
class TaskExecutionLogAdmin(admin.ModelAdmin):
    list_display = ['task', 'status', 'started_at', 'finished_at', 'duration']
    list_filter = ['status', 'started_at']
    readonly_fields = ['started_at', 'finished_at', 'duration']
```

### 2. 通过代码创建任务

```python
from django.utils import timezone
from custom_scheduler.models import CustomPeriodicTask, CustomIntervalSchedule
from django_celery_beat.models import IntervalSchedule

# 创建间隔调度
interval, _ = CustomIntervalSchedule.objects.get_or_create(
    every=10,
    period=IntervalSchedule.SECONDS,
    defaults={'description': '每10秒执行一次'}
)

# 创建周期性任务
task = CustomPeriodicTask.objects.create(
    name='my_task',
    task='your_app.tasks.my_periodic_task',
    customInterval=interval,
    enabled=True,
    task_type='default',
    priority=5,
    args='["arg1", "arg2"]',
    kwargs='{}',
)
```

### 3. 查询任务执行日志

```python
from custom_scheduler.models import CustomPeriodicTask, TaskExecutionLog

# 获取任务
task = CustomPeriodicTask.objects.get(name='my_task')

# 查询执行日志
logs = TaskExecutionLog.objects.filter(task=task).order_by('-started_at')[:10]

for log in logs:
    print(f"{log.started_at} - {log.status} - {log.duration}秒")
```

## 六、注意事项

1. **模型继承**: 自定义模型继承自 `django_celery_beat` 的模型，需要确保字段兼容
2. **调度器配置**: 确保在 `settings.py` 和 `celery.py` 中都配置了自定义调度器
3. **数据库迁移**: 自定义模型会创建新表，不会影响原有的 `django_celery_beat` 表
4. **任务发现**: 确保任务使用 `@shared_task` 装饰器，以便自动发现
5. **时区设置**: 确保 Django 和 Celery 的时区配置一致
6. **错误处理**: 自定义调度器中添加了完善的错误处理，避免单个任务失败影响整体

## 七、常见问题

### Q1: Beat 启动后立即退出？
**A**: 检查：
- Django 应用是否正确初始化
- 数据库连接是否正常
- 自定义模型是否有语法错误
- 查看日志中的具体错误信息

### Q2: 任务不执行？
**A**: 检查：
- Worker 是否正常运行
- 任务是否已启用（`enabled=True`）
- 调度时间是否正确
- 任务名称是否与代码中的任务名称一致

### Q3: 自定义字段无法访问？
**A**: 确保：
- 使用 `hasattr()` 检查字段是否存在
- 字段名与模型定义一致（注意大小写）
- 数据库迁移已执行

## 八、扩展功能

可以根据需要扩展以下功能：

1. **任务依赖**: 实现任务之间的依赖关系
2. **任务分组**: 按类型或优先级分组管理
3. **执行统计**: 更详细的执行统计和分析
4. **告警通知**: 任务失败时发送告警
5. **任务重试**: 自动重试失败的任务
6. **动态调度**: 根据条件动态调整调度策略

## 九、参考资源

- [Celery 官方文档](https://docs.celeryproject.org/)
- [django-celery-beat 文档](https://django-celery-beat.readthedocs.io/)
- [Django 模型继承](https://docs.djangoproject.com/en/stable/topics/db/models/#model-inheritance)


