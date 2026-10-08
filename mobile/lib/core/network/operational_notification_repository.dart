import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'api_client.dart';

class OperationalNotificationItem {
  final String id;
  final String title;
  final String message;
  final String timestamp;
  final String type; // 'alarm', 'warning', 'info', 'success'
  final String? targetRoute;
  final bool isUnread;

  const OperationalNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.type,
    this.targetRoute,
    this.isUnread = true,
  });

  OperationalNotificationItem copyWith({
    String? id,
    String? title,
    String? message,
    String? timestamp,
    String? type,
    String? targetRoute,
    bool? isUnread,
  }) {
    return OperationalNotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      timestamp: timestamp ?? this.timestamp,
      type: type ?? this.type,
      targetRoute: targetRoute ?? this.targetRoute,
      isUnread: isUnread ?? this.isUnread,
    );
  }
}

final notificationRepositoryProvider = Provider<OperationalNotificationRepository>((ref) {
  final dio = ref.watch(apiClientProvider);
  return OperationalNotificationRepository(dio);
});

final notificationsProvider = AsyncNotifierProvider<NotificationsNotifier, List<OperationalNotificationItem>>(NotificationsNotifier.new);

class NotificationsNotifier extends AsyncNotifier<List<OperationalNotificationItem>> {
  late final OperationalNotificationRepository _repo;

  @override
  Future<List<OperationalNotificationItem>> build() async {
    _repo = ref.watch(notificationRepositoryProvider);
    return _repo.fetchNotifications();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repo.fetchNotifications());
  }

  void markAllAsRead() {
    final current = state.value ?? [];
    _repo.markAllAsRead(current);
    state = AsyncValue.data(
      current.map((n) => n.copyWith(isUnread: false)).toList(),
    );
  }

  void markItemAsRead(String id) {
    _repo.markAsRead(id);
    final current = state.value ?? [];
    state = AsyncValue.data(
      current.map((n) => n.id == id ? n.copyWith(isUnread: false) : n).toList(),
    );
  }
}

final unreadNotificationCountProvider = Provider<int>((ref) {
  final notifs = ref.watch(notificationsProvider).value ?? [];
  return notifs.where((n) => n.isUnread).length;
});

class OperationalNotificationRepository {
  final Dio _dio;
  final Set<String> _readIds = {};

  OperationalNotificationRepository(this._dio);

  String _formatDateTime(String? raw) {
    if (raw == null || raw.isEmpty) return 'Baru saja';
    try {
      final dt = DateTime.parse(raw).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.inMinutes < 60) {
        final m = diff.inMinutes;
        return m <= 1 ? '1 menit yang lalu' : '$m menit yang lalu';
      } else if (diff.inHours < 24 && dt.day == now.day) {
        return 'Hari ini, ${DateFormat('HH:mm').format(dt)} WIB';
      } else if (diff.inDays < 2) {
        return 'Kemarin, ${DateFormat('HH:mm').format(dt)} WIB';
      }
      return '${DateFormat('dd MMM yyyy, HH:mm').format(dt)} WIB';
    } catch (_) {
      return raw;
    }
  }

  /// Mengambil notifikasi operasional dinamis dari backend API
  Future<List<OperationalNotificationItem>> fetchNotifications() async {
    final List<OperationalNotificationItem> items = [];

    // 1. Ambil gangguan aktif dari GET /incidents
    try {
      final res = await _dio.get('/incidents', queryParameters: {'limit': 10});
      if (res.statusCode == 200 && res.data?['data'] != null) {
        final rawList = (res.data['data']['items'] ?? res.data['data']['incidents']) as List<dynamic>? ?? [];
        for (final item in rawList) {
          if (item is! Map<String, dynamic>) continue;
          final id = 'incident_${item['id']}';
          final status = (item['status'] as String? ?? 'OPEN').toUpperCase();
          final unit = item['unit'] as Map<String, dynamic>?;
          final unitName = unit?['name'] ?? 'Unit ${item['unit_id'] ?? ''}';
          final equipment = item['equipment'] ?? 'Peralatan';
          final incType = item['incident_type'] ?? 'Gangguan';
          final desc = item['description'] ?? 'Peringatan gangguan operasional.';
          final rawTime = item['occurred_at'] ?? item['created_at'];

          if (status == 'OPEN') {
            items.add(
              OperationalNotificationItem(
                id: id,
                title: 'ALARM: $incType ($unitName)',
                message: '$equipment - $desc',
                timestamp: _formatDateTime(rawTime as String?),
                type: 'alarm',
                targetRoute: '/incidents',
                isUnread: !_readIds.contains(id),
              ),
            );
          } else if (status == 'PROCESS' || status == 'INVESTIGATION') {
            items.add(
              OperationalNotificationItem(
                id: id,
                title: 'PERINGATAN: Penanganan $incType ($unitName)',
                message: '$equipment dalam penanganan perbaikan.',
                timestamp: _formatDateTime(rawTime as String?),
                type: 'warning',
                targetRoute: '/incidents',
                isUnread: !_readIds.contains(id),
              ),
            );
          }
        }
      }
    } catch (_) {}

    // 2. Ambil catatan pemeliharaan dari GET /maintenance
    try {
      final res = await _dio.get('/maintenance', queryParameters: {'limit': 10});
      if (res.statusCode == 200 && res.data?['data'] != null) {
        final rawList = (res.data['data']['items'] ?? res.data['data']['maintenance']) as List<dynamic>? ?? [];
        for (final item in rawList) {
          if (item is! Map<String, dynamic>) continue;
          final id = 'maintenance_${item['id']}';
          final status = (item['status'] as String? ?? 'PLAN').toUpperCase();
          final unit = item['unit'] as Map<String, dynamic>?;
          final unitName = unit?['name'] ?? 'Unit ${item['unit_id'] ?? ''}';
          final equipment = item['equipment'] ?? 'Peralatan';
          final workType = item['work_type'] ?? item['job_type'] ?? 'Pemeliharaan';
          final rawTime = item['planned_date'] ?? item['created_at'];

          if (status == 'PROCESS') {
            items.add(
              OperationalNotificationItem(
                id: id,
                title: 'PEMELIHARAAN: $workType Berjalan ($unitName)',
                message: '$equipment sedang dalam pengerjaan teknisi.',
                timestamp: _formatDateTime(rawTime as String?),
                type: 'warning',
                targetRoute: '/maintenance',
                isUnread: !_readIds.contains(id),
              ),
            );
          } else if (status == 'PLAN') {
            items.add(
              OperationalNotificationItem(
                id: id,
                title: 'JADWAL: $workType ($unitName)',
                message: 'Rencana kerja untuk $equipment.',
                timestamp: _formatDateTime(rawTime as String?),
                type: 'info',
                targetRoute: '/maintenance',
                isUnread: !_readIds.contains(id),
              ),
            );
          } else if (status == 'COMPLETE' || status == 'COMPLETED') {
            items.add(
              OperationalNotificationItem(
                id: id,
                title: 'SELESAI: $workType ($unitName)',
                message: 'Pekerjaan $equipment telah selesai diverifikasi.',
                timestamp: _formatDateTime(rawTime as String?),
                type: 'success',
                targetRoute: '/maintenance',
                isUnread: !_readIds.contains(id),
              ),
            );
          }
        }
      }
    } catch (_) {}

    // 3. Ambil logbook terakhir dari GET /logbook
    try {
      final res = await _dio.get('/logbook', queryParameters: {'limit': 1});
      if (res.statusCode == 200 && res.data?['data'] != null) {
        final rawList = (res.data['data']['items'] ?? res.data['data']['entries']) as List<dynamic>? ?? [];
        if (rawList.isNotEmpty && rawList.first is Map<String, dynamic>) {
          final item = rawList.first as Map<String, dynamic>;
          final id = 'logbook_${item['id']}';
          final shift = item['shift'] ?? 'PAGI';
          final unit = item['unit'] as Map<String, dynamic>?;
          final unitName = unit?['name'] ?? 'Unit ${item['unit_id'] ?? ''}';
          final operatorObj = item['operator'] as Map<String, dynamic>?;
          final opName = operatorObj?['full_name'] ?? operatorObj?['username'] ?? 'Operator';
          final rawTime = item['created_at'] ?? item['date'];

          items.add(
            OperationalNotificationItem(
                id: id,
                title: 'CATATAN OPERASI: Shift $shift ($unitName)',
                message: 'Logsheet tercatat oleh $opName. Status operasi: ${item['unit_status'] ?? 'RUNNING'}.',
                timestamp: _formatDateTime(rawTime as String?),
                type: 'info',
                targetRoute: '/history-logbook',
                isUnread: !_readIds.contains(id),
            ),
          );
        }
      }
    } catch (_) {}

    return items;
  }

  void markAsRead(String id) {
    _readIds.add(id);
  }

  void markAllAsRead(List<OperationalNotificationItem> items) {
    for (final it in items) {
      _readIds.add(it.id);
    }
  }
}
