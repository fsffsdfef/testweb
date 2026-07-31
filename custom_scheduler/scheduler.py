"""
自定义 Celery Beat 调度器
继承 django_celery_beat 的调度器，扩展自定义功能
"""
import json
import logging
from django.utils import timezone
from django_celery_beat.schedulers import DatabaseScheduler
from django_celery_beat.models import PeriodicTask
from celery import current_app
from celery.schedules import crontab, schedule
from django_celery_beat.models import (
    PeriodicTask,
    PeriodicTasks,
    IntervalSchedule,
    ClockedSchedule,
    SolarSchedule,
    CrontabSchedule
)

# 导入自定义模型
try:
    from .models import CustomPeriodicTask, TaskExecutionLog
    HAS_CUSTOM_MODEL = True
except ImportError:
    # 如果导入失败，使用标准模型
    CustomPeriodicTask = PeriodicTask
    TaskExecutionLog = None
    HAS_CUSTOM_MODEL = False

logger = logging.getLogger(__name__)


class CustomDatabaseScheduler(DatabaseScheduler):
    """
    自定义数据库调度器
    扩展了任务执行日志、错误处理、重试机制等功能
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._last_tick = None
        self._last_update_time = None
        self._update_interval = 60  # 每60秒更新一次，避免频繁查询数据库

    def setup_schedule(self):
        """设置调度计划"""
        try:
            # 调用父类的 setup_schedule，它会使用我们重写的 all_as_schedule
            # all_as_schedule 已经过滤掉了没有调度器的任务
            super().setup_schedule()
            # 初始化自定义任务（只处理 CustomPeriodicTask）
            if HAS_CUSTOM_MODEL:
                self._sync_custom_tasks()
        except Exception as e:
            logger.error(f"Error in setup_schedule: {e}", exc_info=True)
            raise

    def _sync_custom_tasks(self):
        """同步自定义任务到 Celery Beat"""
        if not HAS_CUSTOM_MODEL:
            return
            
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
            # 获取任务调度
            schedule_obj = self._get_task_schedule(task)
            if schedule_obj:
                # 添加到 Celery Beat
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
            # 如果任务有 schedule 属性（CustomPeriodicTask 已重写），直接使用
            if hasattr(task, 'schedule'):
                schedule_obj = task.schedule
                if schedule_obj is not None:
                    return schedule_obj
            
            # 兼容标准 PeriodicTask 或没有重写 schedule 的情况
            # 优先检查标准调度类型
            if task.interval:
                return task.interval.schedule
            elif task.crontab:
                return task.crontab.schedule
            elif task.solar:
                return task.solar.schedule
            elif task.clocked:
                return task.clocked.schedule
            
            # 检查自定义调度类型（兼容下划线和驼峰命名）
            if hasattr(task, 'custom_interval') and task.custom_interval:
                return task.custom_interval.schedule
            elif hasattr(task, 'customInterval') and task.customInterval:
                return task.customInterval.schedule
            elif hasattr(task, 'custom_crontab') and task.custom_crontab:
                return crontab(
                    minute=task.custom_crontab.minute,
                    hour=task.custom_crontab.hour,
                    day_of_week=task.custom_crontab.day_of_week,
                    day_of_month=task.custom_crontab.day_of_month,
                    month_of_year=task.custom_crontab.month_of_year,
                )
            elif hasattr(task, 'customCrontab') and task.customCrontab:
                return crontab(
                    minute=task.customCrontab.minute,
                    hour=task.customCrontab.hour,
                    day_of_week=task.customCrontab.day_of_week,
                    day_of_month=task.customCrontab.day_of_month,
                    month_of_year=task.customCrontab.month_of_year,
                )
            elif hasattr(task, 'custom_solar') and task.custom_solar:
                return task.custom_solar.schedule
            elif hasattr(task, 'customSolar') and task.customSolar:
                return task.customSolar.schedule
            elif hasattr(task, 'custom_clocked') and task.custom_clocked:
                return task.custom_clocked.schedule
            elif hasattr(task, 'customClocked') and task.customClocked:
                return task.customClocked.schedule
            
            return None
        except AttributeError as e:
            logger.warning(f"Attribute error getting schedule for task {getattr(task, 'name', 'unknown')}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error getting schedule for task {getattr(task, 'name', 'unknown')}: {e}", exc_info=True)
            return None

    def all_as_schedule(self):
        """
        重写 all_as_schedule 方法，过滤掉没有调度器的任务
        这个方法被父类的 setup_schedule 调用
        """
        s = {}
        # 只处理有有效调度器的任务
        for model in PeriodicTask.objects.filter(enabled=True):
            # 检查是否有有效的调度器
            if not self._has_valid_schedule(model):
                logger.warning(f"Skipping task {model.name}: no valid schedule configured")
                continue
            
            try:
                # 使用父类的 Entry 类创建 entry
                # Entry 是 DatabaseScheduler 的内部类
                entry = self.Entry(model, app=self.app)
                s[model.name] = entry
            except (AttributeError, TypeError) as e:
                # 如果创建 Entry 失败（通常是因为没有调度器），跳过该任务
                logger.warning(f"Skipping task {model.name}: cannot create entry - {e}")
                continue
            except Exception as e:
                logger.error(f"Error processing task {model.name}: {e}", exc_info=True)
                continue
        
        return s

    def sync(self):
        """同步任务到数据库"""
        try:
            # 调用父类的 sync，但 all_as_schedule 已经被我们重写，会过滤无效任务
            super().sync()
            # 同步自定义任务（只处理 CustomPeriodicTask）
            if HAS_CUSTOM_MODEL:
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
                # 只处理 CustomPeriodicTask
                if HAS_CUSTOM_MODEL:
                    custom_task = CustomPeriodicTask.objects.get(task=task_name, enabled=True)
                    if TaskExecutionLog:
                        log = TaskExecutionLog.objects.create(
                            task=custom_task,
                            status='pending'
                        )
            except CustomPeriodicTask.DoesNotExist:
                pass
            except Exception as e:
                logger.warning(f"Error creating log for task {task_name}: {e}")

        try:
            # 调用父类方法执行任务
            result = super().apply_async(entry, producer=producer, advance=advance, **kwargs)

            # 更新日志状态
            if log:
                try:
                    log.status = 'running'
                    log.save(update_fields=['status'])
                except Exception as e:
                    logger.warning(f"Error updating log status: {e}")

            return result
        except Exception as e:
            # 记录错误
            if log and TaskExecutionLog:
                try:
                    log.finish(
                        status='failure',
                        error_message=str(e),
                        traceback=str(e.__traceback__) if hasattr(e, '__traceback__') else None
                    )
                except Exception as log_error:
                    logger.warning(f"Error finishing log: {log_error}")
            
            # 更新任务失败计数（只处理 CustomPeriodicTask）
            if custom_task and hasattr(custom_task, 'record_failure'):
                try:
                    custom_task.record_failure(str(e))
                except Exception as record_error:
                    logger.warning(f"Error recording failure: {record_error}")
            
            raise

    def tick(self, event_t=None, min=min, **kwargs):
        """每次调度周期执行"""
        try:
            # 限制更新频率，避免每次 tick 都查询数据库
            now = timezone.now()
            if (self._last_update_time is None or 
                (now - self._last_update_time).total_seconds() >= self._update_interval):
                if HAS_CUSTOM_MODEL:
                    self._update_next_run_times()
                self._last_update_time = now
            
            # 确保 event_t 不是 None，使用默认的 ScheduleEntry
            if event_t is None:
                from celery.beat import ScheduleEntry
                event_t = ScheduleEntry
            
            return super().tick(event_t=event_t, min=min, **kwargs)
        except Exception as e:
            logger.error(f"Error in tick: {e}", exc_info=True)
            # 即使更新失败，也继续执行父类的 tick
            if event_t is None:
                from celery.beat import ScheduleEntry
                event_t = ScheduleEntry
            return super().tick(event_t=event_t, min=min, **kwargs)

    def _update_next_run_times(self):
        """更新所有任务的下次执行时间"""
        # 只处理 CustomPeriodicTask，并且确保有 update_next_run_time 方法
        if not HAS_CUSTOM_MODEL:
            return
            
        try:
            now = timezone.now()
            # 只查询 CustomPeriodicTask，并且确保有 next_run_at 字段
            queryset = CustomPeriodicTask.objects.filter(enabled=True)
            
            # 检查是否有 next_run_at 字段
            if hasattr(CustomPeriodicTask, 'next_run_at'):
                queryset = queryset.filter(next_run_at__lte=now)
            
            for task in queryset:
                try:
                    # 确保任务有 update_next_run_time 方法
                    if hasattr(task, 'update_next_run_time'):
                        task.update_next_run_time()
                    else:
                        logger.debug(f"Task {task.name} does not have update_next_run_time method")
                except Exception as e:
                    logger.warning(f"Error updating next run time for task {task.name}: {e}")
        except Exception as e:
            logger.error(f"Error in _update_next_run_times: {e}", exc_info=True)

    def close(self):
        """关闭调度器"""
        try:
            super().close()
        except Exception as e:
            logger.error(f"Error in close: {e}", exc_info=True)

    def get_from_database(self):
        """从数据库获取任务"""
        tasks = {}
        
        try:
            # 获取标准 PeriodicTask，但过滤掉没有调度器的任务
            for model in PeriodicTask.objects.filter(enabled=True):
                # 检查是否有有效的调度器
                if not self._has_valid_schedule(model):
                    logger.warning(f"Skipping task {model.name}: no valid schedule configured")
                    continue
                
                try:
                    # 使用父类的 Entry 类创建 entry
                    entry = self.Entry(model, app=self.app)
                    tasks[model.name] = entry
                except (AttributeError, TypeError) as e:
                    # 如果创建 Entry 失败（通常是因为没有调度器），跳过该任务
                    logger.warning(f"Skipping task {model.name}: cannot create entry - {e}")
                    continue
                except Exception as e:
                    logger.error(f"Error processing task {model.name}: {e}", exc_info=True)
                    continue
            
            # 添加 CustomPeriodicTask，避免与标准任务重复
            if HAS_CUSTOM_MODEL:
                for custom_task in CustomPeriodicTask.objects.filter(enabled=True):
                    # 避免与标准任务重复（如果名称相同，跳过）
                    if custom_task.name in tasks:
                        logger.debug(f"Skipping duplicate task name: {custom_task.name}")
                        continue
                    
                    # 检查是否有有效的调度器
                    if not self._has_valid_schedule(custom_task):
                        logger.warning(f"Skipping custom task {custom_task.name}: no valid schedule configured")
                        continue
                    
                    try:
                        schedule_obj = self._get_task_schedule(custom_task)
                        if schedule_obj:
                            # 为自定义任务也创建 Entry 对象，保持格式一致
                            # 创建一个临时的任务配置字典
                            task_config = {
                                'task': custom_task.task,
                                'schedule': schedule_obj,
                                'args': json.loads(custom_task.args) if custom_task.args else (),
                                'kwargs': json.loads(custom_task.kwargs) if custom_task.kwargs else {},
                                'options': json.loads(custom_task.options) if custom_task.options else {},
                            }
                            # 尝试创建 Entry，如果失败则使用字典格式
                            try:
                                entry = self.Entry(custom_task, app=self.app)
                                tasks[custom_task.name] = entry
                            except (AttributeError, TypeError):
                                # 如果无法创建 Entry，使用字典格式
                                tasks[custom_task.name] = task_config
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON decode error for task {custom_task.name}: {e}")
                        continue
                    except Exception as e:
                        logger.error(f"Error processing custom task {custom_task.name}: {e}", exc_info=True)
                        continue
            
            return tasks
        except Exception as e:
            logger.error(f"Error in get_from_database: {e}", exc_info=True)
            # 如果出错，返回空字典而不是调用父类（避免重复错误）
            return {}
    
    @staticmethod
    def _has_valid_schedule(task):
        """检查任务是否有有效的调度器"""
        # 如果任务有 schedule 属性（CustomPeriodicTask 已重写），直接检查
        if hasattr(task, 'schedule'):
            try:
                schedule_obj = task.schedule
                if schedule_obj is not None:
                    return True
            except (AttributeError, TypeError):
                pass
        
        # 检查标准调度类型
        if task.interval or task.crontab or task.solar or task.clocked:
            return True
        
        # 检查自定义调度类型（兼容下划线和驼峰命名）
        if hasattr(task, 'custom_interval') and task.custom_interval:
            return True
        if hasattr(task, 'customInterval') and task.customInterval:
            return True
        if hasattr(task, 'custom_crontab') and task.custom_crontab:
            return True
        if hasattr(task, 'customCrontab') and task.customCrontab:
            return True
        if hasattr(task, 'custom_solar') and task.custom_solar:
            return True
        if hasattr(task, 'customSolar') and task.customSolar:
            return True
        if hasattr(task, 'custom_clocked') and task.custom_clocked:
            return True
        if hasattr(task, 'customClocked') and task.customClocked:
            return True
        
        return False


class TaskResultHandler:
    """任务结果处理器"""

    @staticmethod
    def handle_success(task_name, result=None):
        """处理任务成功"""
        try:
            if not HAS_CUSTOM_MODEL:
                return
                
            task = CustomPeriodicTask.objects.get(task=task_name)
            
            # 确保有 record_success 方法
            if hasattr(task, 'record_success'):
                task.record_success()
            
            # 更新最新的执行日志
            if TaskExecutionLog:
                try:
                    log = TaskExecutionLog.objects.filter(
                        task=task,
                        status='running'
                    ).order_by('-started_at').first()
                    
                    if log:
                        log.finish(
                            status='success',
                            result=str(result) if result else None
                        )
                except Exception as e:
                    logger.warning(f"Error updating log for task {task_name}: {e}")
        except CustomPeriodicTask.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Error handling success for task {task_name}: {e}", exc_info=True)

    @staticmethod
    def handle_failure(task_name, error_msg=None, traceback=None):
        """处理任务失败"""
        try:
            if not HAS_CUSTOM_MODEL:
                return
                
            task = CustomPeriodicTask.objects.get(task=task_name)
            
            # 确保有 record_failure 方法
            if hasattr(task, 'record_failure'):
                task.record_failure(error_msg)

            # 更新最新的执行日志
            if TaskExecutionLog:
                try:
                    log = TaskExecutionLog.objects.filter(
                        task=task,
                        status='running'
                    ).order_by('-started_at').first()
                    
                    if log:
                        log.finish(
                            status='failure',
                            error_message=error_msg,
                            traceback=traceback
                        )
                except Exception as e:
                    logger.warning(f"Error updating log for task {task_name}: {e}")
        except CustomPeriodicTask.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Error handling failure for task {task_name}: {e}", exc_info=True)
