import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';

class QuickActionItem {
  final String label;
  final String? assetPath;
  final IconData? iconData;
  final Color backgroundColor;
  final Color iconColor;
  final VoidCallback onTap;

  const QuickActionItem({
    required this.label,
    this.assetPath,
    this.iconData,
    required this.backgroundColor,
    required this.iconColor,
    required this.onTap,
  });
}

class QuickActionsGrid extends StatelessWidget {
  final Function(String route)? onActionTap;

  const QuickActionsGrid({super.key, this.onActionTap});

  @override
  Widget build(BuildContext context) {
    final actions = [
      QuickActionItem(
        label: 'Logbook',
        assetPath: AppAssets.icLogbook,
        backgroundColor: const Color(0xFF2563EB), // Rich Blue
        iconColor: Colors.white,
        onTap: () => onActionTap?.call('/logbook'),
      ),
      QuickActionItem(
        label: 'Maintenance',
        assetPath: AppAssets.icMaintenance,
        backgroundColor: const Color(0xFF16A34A), // Emerald Green
        iconColor: Colors.white,
        onTap: () => onActionTap?.call('/maintenance'),
      ),
      QuickActionItem(
        label: 'Gangguan',
        assetPath: AppAssets.icAlert,
        backgroundColor: const Color(0xFFEF4444), // Coral Red
        iconColor: Colors.white,
        onTap: () => onActionTap?.call('/gangguan'),
      ),
      QuickActionItem(
        label: 'Inspeksi',
        iconData: Icons.fact_check_rounded,
        backgroundColor: const Color(0xFF10B981), // Teal Green
        iconColor: Colors.white,
        onTap: () => onActionTap?.call('/inspeksi'),
      ),
      QuickActionItem(
        label: 'Laporan',
        iconData: Icons.insert_chart_outlined_rounded,
        backgroundColor: const Color(0xFF3B82F6), // Blue 500
        iconColor: Colors.white,
        onTap: () => onActionTap?.call('/laporan'),
      ),
      QuickActionItem(
        label: 'Lainnya',
        iconData: Icons.grid_view_rounded,
        backgroundColor: const Color(0xFFE2E8F0), // Subtle light slate
        iconColor: const Color(0xFF475569),
        onTap: () => onActionTap?.call('/lainnya'),
      ),
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // We will build a 2-row layout: 3 items top, 3 items bottom
        Expanded(
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: actions.sublist(0, 3).map(_buildActionCard).toList(),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: actions.sublist(3, 6).map(_buildActionCard).toList(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionCard(QuickActionItem item) {
    return GestureDetector(
      onTap: item.onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: item.backgroundColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: item.backgroundColor.withValues(alpha: 0.28),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: item.assetPath != null
                  ? Image.asset(
                      item.assetPath!,
                      width: 26,
                      height: 26,
                      color: item.iconColor,
                    )
                  : Icon(
                      item.iconData,
                      size: 26,
                      color: item.iconColor,
                    ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            item.label,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.neutral700,
            ),
          ),
        ],
      ),
    );
  }
}
