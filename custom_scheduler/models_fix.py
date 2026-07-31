"""
修复后的 CustomPeriodicTask 模型
根据用户提供的代码修复 scheduler 和 schedule 属性
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django_celery_beat.models import (
    PeriodicTask,
    IntervalSchedule,
    ClockedSchedule,
    SolarSchedule,
    CrontabSchedule
)


class CustomPeriodicTask(PeriodicTask):
    """
    自定义周期性任务表
    注意：字段名使用驼峰命名（customInterval, customCrontab 等）
    """
    
    # 自定义调度字段（驼峰命名）
    customInterval = models.ForeignKey(
        'CustomIntervalSchedule',  # 需要替换为实际的模型引用
        null=True, blank=True, on_delete=models.CASCADE,
        related_name='task', verbose_name='自定义调度器'
    )

    customCrontab = models.ForeignKey(
        'CustomCrontabSchedule',  # 需要替换为实际的模型引用
        on_delete=models.CASCADE, null=True, blank=True,
        verbose_name=_('Crontab Schedule'),
        help_text=_('Crontab Schedule to run the task on.  '
                    'Set only one schedule type, leave the others null.'),
    )

    customSolar = models.ForeignKey(
        'CustomSolarSchedule',  # 需要替换为实际的模型引用
        on_delete=models.CASCADE, null=True, blank=True,
        verbose_name=_('Solar Schedule'),
        help_text=_('Solar Schedule to run the task on.  '
                    'Set only one schedule type, leave the others null.'),
    )
    
    customClocked = models.ForeignKey(
        'CustomClockedSchedule',  # 需要替换为实际的模型引用
        on_delete=models.CASCADE, null=True, blank=True,
        verbose_name=_('Clocked Schedule'),
        help_text=_('Clocked Schedule to run the task on.  '
                    'Set only one schedule type, leave the others null.'),
    )

    class Meta:
        db_table = "t_task"

    def validate_unique(self, *args, **kwargs):
        schedule_types = ['interval', 'crontab', 'solar', 'clocked',
                          'customInterval', 'customClocked', 'customSolar', 'customCrontab']
        selected_schedule_types = [s for s in schedule_types
                                   if getattr(self, s)]

        if len(selected_schedule_types) == 0:
            raise ValidationError(
                'One of clocked, interval, crontab, or solar '
                'must be set.'
            )

        err_msg = 'Only one of clocked, interval, crontab, ' \
                  'or solar must be set'
        if len(selected_schedule_types) > 1:
            error_info = {}
            for selected_schedule_type in selected_schedule_types:
                error_info[selected_schedule_type] = [err_msg]
            raise ValidationError(error_info)

        # clocked must be one off task
        if self.clocked and not self.one_off:
            err_msg = 'clocked must be one off, one_off must set True'
            raise ValidationError(err_msg)

    @property
    def scheduler(self):
        """
        返回当前使用的调度器对象本身（不是 schedule）
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
        
        # 检查自定义调度类型（驼峰命名）
        if self.customInterval:
            return self.customInterval
        elif self.customCrontab:
            return self.customCrontab
        elif self.customSolar:
            return self.customSolar
        elif self.customClocked:
            return self.customClocked
        
        # 如果没有设置任何调度器，返回 None
        return None

    @property
    def schedule(self):
        """
        重写 schedule 属性，支持自定义调度字段
        直接返回 Celery 调度对象，而不是通过 scheduler.schedule
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
        
        # 检查自定义调度类型（驼峰命名）
        if self.customInterval:
            return self.customInterval.schedule
        elif self.customCrontab:
            # 自定义 Crontab 需要转换为 Celery 的 crontab schedule
            from django_celery_beat.schedulers import crontab
            return crontab(
                minute=self.customCrontab.minute,
                hour=self.customCrontab.hour,
                day_of_week=self.customCrontab.day_of_week,
                day_of_month=self.customCrontab.day_of_month,
                month_of_year=self.customCrontab.month_of_year,
            )
        elif self.customSolar:
            return self.customSolar.schedule
        elif self.customClocked:
            return self.customClocked.schedule
        
        # 如果没有找到任何调度器，返回 None
        # 注意：返回 None 会导致父类访问时出错，但这是预期的行为
        # 应该在 validate_unique 中确保至少有一个调度器
        return None


