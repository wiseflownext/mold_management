import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/reminder.dart';
import '../services/reminder_service.dart';

final alertsProvider = FutureProvider<List<MaintenanceAlert>>(
  (ref) => ReminderService.instance.getAlerts(),
);

final reminderSettingsProvider = FutureProvider<List<ReminderSetting>>(
  (ref) => ReminderService.instance.getSettings(),
);
