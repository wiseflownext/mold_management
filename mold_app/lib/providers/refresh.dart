import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'mold_provider.dart';
import 'reminder_provider.dart';
import 'notification_provider.dart';

void refreshAll(WidgetRef ref) {
  ref.invalidate(dashboardProvider);
  ref.invalidate(moldStatisticsProvider);
  ref.invalidate(todaySummaryProvider);
  ref.invalidate(alertsProvider);
  ref.invalidate(unreadCountProvider);
  try { ref.read(moldListNotifierProvider.notifier).load(); } catch (_) {}
}

void refreshAfterMoldChange(WidgetRef ref, {String? moldId}) {
  if (moldId != null) ref.invalidate(moldDetailProvider(moldId));
  ref.invalidate(dashboardProvider);
  ref.invalidate(moldStatisticsProvider);
  ref.invalidate(alertsProvider);
  ref.invalidate(unreadCountProvider);
  try { ref.read(moldListNotifierProvider.notifier).load(); } catch (_) {}
}

void refreshAfterRecord(WidgetRef ref, {String? moldId}) {
  if (moldId != null) ref.invalidate(moldDetailProvider(moldId));
  ref.invalidate(dashboardProvider);
  ref.invalidate(todaySummaryProvider);
  ref.invalidate(alertsProvider);
  ref.invalidate(unreadCountProvider);
  try { ref.read(moldListNotifierProvider.notifier).load(); } catch (_) {}
}
