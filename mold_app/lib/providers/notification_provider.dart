import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/notification.dart';
import '../models/pagination.dart';
import '../services/notification_service.dart';

final notificationListProvider =
    FutureProvider.family<PaginatedResponse<AppNotification>, NotificationListParams>(
  (ref, params) =>
      NotificationService.instance.getList(params.page, params.pageSize),
);

class NotificationListParams {
  final int page;
  final int pageSize;

  NotificationListParams({this.page = 1, this.pageSize = 20});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NotificationListParams &&
          other.page == page &&
          other.pageSize == pageSize;

  @override
  int get hashCode => Object.hash(page, pageSize);
}

final unreadCountProvider = FutureProvider<int>(
  (ref) => NotificationService.instance.getUnreadCount(),
);
