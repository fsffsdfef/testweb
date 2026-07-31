# 自定义 Celery Beat 调度器

基于 `django_celery_beat` 扩展的自定义任务调度系统，提供更丰富的功能和更好的管理体验。

## 功能特性

1. **自定义数据表**
   - `CustomIntervalSchedule`: 自定义间隔调度表
   - `CustomCrontabSchedule`: 自定义 Crontab 调度表
   - `CustomPeriodicTask`: 自定义周期性任务表（扩展字段）
   - `TaskExecutionLog`: 任务执行日志表

2. **扩展功能**
   - 任务类型分类
   - 优先级管理
   - 重试机制
   - 执行统计（运行次数、成功次数、失败次数）
   - 执行日志记录
   - 错误信息追踪

3. **自定义调度器**
   - 继承 `DatabaseScheduler`
   - 支持自定义调度表
   - 自动更新下次执行时间
   - 任务执行日志记录

## 安装配置

### 1. 安装依赖

```bash
pip install django-celery-beat celery
```

### 2. 添加到 Django 设置

在 `settings.py` 中添加：

```python
INSTALLED_APPS = [
    # ... 其他应用
    'django_celery_beat',
    'custom_scheduler',
]

# Celery 配置
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_BEAT_SCHEDULER = 'custom_scheduler.scheduler:CustomDatabaseScheduler'
CELERY_TIMEZONE = 'Asia/Shanghai'
CELERY_ENABLE_UTC = True
```

### 3. 数据库迁移

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. 启动 Celery Worker

```bash
celery -A your_project worker -l info
```

### 5. 启动 Celery Beat

```bash
celery -A your_project beat -l info --scheduler custom_scheduler.scheduler:CustomDatabaseScheduler
```

## 使用方法

### 1. 创建任务

```python
# tasks.py
from celery import shared_task

@shared_task
def my_periodic_task(arg1, arg2):
    """示例周期性任务"""
    print(f"执行任务: {arg1}, {arg2}")
    return "任务完成"
```

### 2. 创建调度任务

```python
from django.utils import timezone
from custom_scheduler.models import (
    CustomPeriodicTask,
    CustomIntervalSchedule
)

# 创建间隔调度
schedule, _ = CustomIntervalSchedule.objects.get_or_create(
    every=10,
    period=CustomIntervalSchedule.SECONDS,
    description='每10秒执行一次'
)

# 创建周期性任务
task = CustomPeriodicTask.objects.create(
    name='我的测试任务',
    task='my_app.tasks.my_periodic_task',
    interval=schedule,
    args='["arg1", "arg2"]',
    kwargs='{}',
    enabled=True,
    task_type='default',
    priority=5,
    max_retries=3,
    created_by='admin'
)
```

### 3. 使用 Django Admin 管理

访问 Django Admin，可以：
- 查看和管理所有任务
- 查看执行日志
- 启用/禁用任务
- 重置统计信息

### 4. 同步任务

```bash
python manage.py sync_tasks
```

## 模型字段说明

### CustomPeriodicTask 扩展字段

- `task_type`: 任务类型（default, data_sync, report, cleanup, notification）
- `priority`: 优先级（1-10）
- `retry_count`: 当前重试次数
- `max_retries`: 最大重试次数
- `last_run_at`: 最后运行时间
- `next_run_at`: 下次运行时间
- `run_count`: 运行次数
- `success_count`: 成功次数
- `failure_count`: 失败次数
- `error_message`: 错误信息
- `created_by`: 创建人
- `updated_by`: 更新人

## API 使用示例

```python
from custom_scheduler.models import CustomPeriodicTask

# 获取所有启用的任务
tasks = CustomPeriodicTask.objects.filter(enabled=True)

# 获取任务执行日志
task = CustomPeriodicTask.objects.get(name='我的任务')
logs = task.execution_logs.all()

# 手动触发任务执行
from my_app.tasks import my_periodic_task
result = my_periodic_task.delay('arg1', 'arg2')

# 更新任务状态
task.enabled = False
task.save()
```

## 注意事项

1. 确保 Redis 或 RabbitMQ 正常运行
2. 确保数据库迁移已完成
3. 启动 Celery Beat 前先同步任务
4. 任务执行结果会自动记录到日志表
5. 建议定期清理旧的执行日志

## 扩展开发

如需扩展功能，可以：

1. 在 `models.py` 中添加新字段
2. 在 `scheduler.py` 中扩展调度逻辑
3. 在 `admin.py` 中自定义管理界面
4. 添加新的信号处理器

## 许可证

MIT License








