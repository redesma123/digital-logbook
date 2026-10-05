import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

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
}

class NotificationBottomSheet extends StatefulWidget {
  const NotificationBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const NotificationBottomSheet(),
    );
  }

  @override
  State<NotificationBottomSheet> createState() => _NotificationBottomSheetState();
}

class _NotificationBottomSheetState extends State<NotificationBottomSheet> {
  late List<OperationalNotificationItem> _notifications;

  @override
  void initState() {
    super.initState();
    _notifications = [
      const OperationalNotificationItem(
        id: '1',
        title: 'ALARM: Generator Unit 1 Trip',
        message: 'Proteksi Over Current (51) aktif pada Generator Unit 1. Segera lakukan pengecekan relay dan kondisi belitan.',
        timestamp: '12 Apr 2025, 14:25 WIB',
        type: 'alarm',
        targetRoute: '/incidents',
        isUnread: true,
      ),
      const OperationalNotificationItem(
        id: '2',
        title: 'Peringatan: Vibrasi Turbin Meningkat',
        message: 'Sensor vibrasi bantalan turbin mendeteksi 4.8 mm/s mendekati batas batas toleransi (5.0 mm/s).',
        timestamp: '08 Apr 2025, 10:15 WIB',
        type: 'warning',
        targetRoute: '/incidents',
        isUnread: true,
      ),
      const OperationalNotificationItem(
        id: '3',
        title: 'Pengingat Pengisian Logsheet Shift',
        message: 'Waktu operan shift pagi (07:00 - 15:00). Pastikan pencatatan Hour Meter dan parameter operasi telah lengkap.',
        timestamp: 'Hari ini, 07:00 WIB',
        type: 'info',
        targetRoute: '/history-logbook',
        isUnread: false,
      ),
      const OperationalNotificationItem(
        id: '4',
        title: 'Maintenance Selesai: Trash Rack',
        message: 'Pembersihan trash rack intake selesai dikerjakan oleh Tim Sipil & Operasi. Debit air kembali normal 2.85 m³/s.',
        timestamp: '03 Apr 2025, 11:30 WIB',
        type: 'success',
        targetRoute: '/maintenance',
        isUnread: false,
      ),
    ];
  }

  void _markAllAsRead() {
    setState(() {
      _notifications = _notifications
          .map((n) => OperationalNotificationItem(
                id: n.id,
                title: n.title,
                message: n.message,
                timestamp: n.timestamp,
                type: n.type,
                targetRoute: n.targetRoute,
                isUnread: false,
              ))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.78,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Notifikasi Operasional',
                      style: GoogleFonts.inter(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppColors.neutral900,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'PLTMh Sampean Baru',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: _markAllAsRead,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  ),
                  child: Text(
                    'Tandai dibaca',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // Notifications List
          Flexible(
            child: ListView.separated(
              shrinkWrap: true,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _notifications.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = _notifications[index];
                return _buildNotificationCard(context, item);
              },
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(BuildContext context, OperationalNotificationItem item) {
    Color iconBg;
    Color iconColor;
    IconData icon;

    switch (item.type) {
      case 'alarm':
        iconBg = const Color(0xFFFEE2E2);
        iconColor = const Color(0xFFEF4444);
        icon = Icons.error_outline_rounded;
        break;
      case 'warning':
        iconBg = const Color(0xFFFEF3C7);
        iconColor = const Color(0xFFD97706);
        icon = Icons.warning_amber_rounded;
        break;
      case 'success':
        iconBg = const Color(0xFFDCFCE7);
        iconColor = const Color(0xFF16A34A);
        icon = Icons.check_circle_outline_rounded;
        break;
      case 'info':
      default:
        iconBg = const Color(0xFFDBEAFE);
        iconColor = const Color(0xFF2563EB);
        icon = Icons.notifications_none_rounded;
        break;
    }

    return InkWell(
      onTap: () {
        if (item.targetRoute != null) {
          Navigator.pop(context);
          context.push(item.targetRoute!);
        }
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: item.isUnread ? const Color(0xFFF8FAFC) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: item.isUnread ? const Color(0xFFCBD5E1) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconBg,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Icon(icon, color: iconColor, size: 20),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: item.isUnread ? FontWeight.w700 : FontWeight.w600,
                            color: AppColors.neutral900,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (item.isUnread)
                        Container(
                          width: 7,
                          height: 7,
                          margin: const EdgeInsets.only(left: 6),
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.message,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      color: const Color(0xFF475569),
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.timestamp,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
