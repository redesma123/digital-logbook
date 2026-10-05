import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class MenuHubBottomSheet extends StatelessWidget {
  const MenuHubBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const MenuHubBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final menuItems = [
      _MenuHubItem(
        title: 'Histori Logbook',
        subtitle: 'Logsheet shift & operan',
        icon: Icons.menu_book_rounded,
        color: const Color(0xFF2563EB),
        route: '/history-logbook',
      ),
      _MenuHubItem(
        title: 'Daftar Gangguan',
        subtitle: 'Insiden, trip & penanganan',
        icon: Icons.warning_rounded,
        color: const Color(0xFFEF4444),
        route: '/incidents',
      ),
      _MenuHubItem(
        title: 'Daftar Maintenance',
        subtitle: 'Jadwal servis & pemeliharaan',
        icon: Icons.build_circle_rounded,
        color: const Color(0xFF16A34A),
        route: '/maintenance',
      ),
      _MenuHubItem(
        title: 'Checklist Inspeksi',
        subtitle: 'Inspeksi visual & fisik peralatan',
        icon: Icons.fact_check_rounded,
        color: const Color(0xFF10B981),
        route: '/inspeksi',
      ),
      _MenuHubItem(
        title: 'Laporan & Dashboard',
        subtitle: 'Tren daya, debit & efisiensi',
        icon: Icons.insert_chart_rounded,
        color: const Color(0xFF0284C7),
        route: '/unit-dashboard',
      ),
      _MenuHubItem(
        title: 'Menu Lainnya',
        subtitle: 'SOP, kontak darurat & data unit',
        icon: Icons.grid_view_rounded,
        color: const Color(0xFF64748B),
        route: '/lainnya',
      ),
    ];

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * 0.9,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 24),
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
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Pusat Menu Operasional',
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
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: AppColors.neutral500),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          const SizedBox(height: 12),

          // Menu Grid
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: menuItems.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 2.1,
              ),
              itemBuilder: (context, index) {
                final item = menuItems[index];
                return InkWell(
                  onTap: () {
                    Navigator.pop(context);
                    context.push(item.route);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: item.color.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Icon(item.icon, color: item.color, size: 20),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                item.title,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.neutral900,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                item.subtitle,
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w400,
                                  color: const Color(0xFF64748B),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),

          // Shortcut to Input Logbook button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  context.push('/input-logbook');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                icon: const Icon(Icons.add_circle_outline, color: Colors.white, size: 18),
                label: Text(
                  'Input Logbook Shift Baru',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
        ),
      ),
    );
  }
}

class _MenuHubItem {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String route;

  const _MenuHubItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.route,
  });
}
