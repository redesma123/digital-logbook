import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../domain/incident_model.dart';
import 'controllers/incident_controller.dart';

class IncidentListScreen extends ConsumerStatefulWidget {
  const IncidentListScreen({super.key});

  @override
  ConsumerState<IncidentListScreen> createState() => _IncidentListScreenState();
}

class _IncidentListScreenState extends ConsumerState<IncidentListScreen> {
  final List<String> _statusFilters = [
    'Semua Status',
    'Open',
    'Process',
    'Closed',
  ];

  void _onBottomNavTap(int index) {
    if (index == 0) {
      context.go('/home');
    } else if (index == 1) {
      // Current screen: Daftar Gangguan
    } else if (index == 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tidak ada notifikasi baru'),
          duration: Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else if (index == 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Halaman Profil sedang disiapkan'),
          duration: Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(incidentControllerProvider);

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0284C7),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
        ),
        title: Text(
          'Daftar Gangguan',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Colors.white, size: 24),
            tooltip: 'Tambah Gangguan',
            onPressed: () => context.push('/input-incident'),
          ),
        ],
        centerTitle: false,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Filter Status Dropdown Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: AppColors.neutral50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.neutral300),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: state.statusFilter,
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.neutral500),
                        items: _statusFilters.map((st) {
                          return DropdownMenuItem<String>(
                            value: st,
                            child: Text(
                              st,
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: AppColors.neutral900,
                              ),
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            ref.read(incidentControllerProvider.notifier).filterByStatus(val);
                          }
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.neutral200),

          // Incident Cards List
          Expanded(
            child: state.isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFF0284C7)),
                  )
                : state.incidents.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.info_outline, size: 48, color: AppColors.neutral400),
                            const SizedBox(height: 12),
                            Text(
                              'Tidak ada data gangguan.',
                              style: GoogleFonts.inter(
                                fontSize: 15,
                                fontWeight: FontWeight.w500,
                                color: AppColors.neutral500,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        itemCount: state.incidents.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = state.incidents[index];
                          return _buildIncidentCard(item);
                        },
                      ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(color: AppColors.neutral200, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: 1, // Gangguan is active
          onTap: _onBottomNavTap,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF0284C7),
          unselectedItemColor: AppColors.neutral400,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          selectedLabelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600),
          unselectedLabelStyle: GoogleFonts.inter(fontWeight: FontWeight.w500),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Beranda',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.warning_amber_rounded),
              activeIcon: Icon(Icons.warning_rounded),
              label: 'Gangguan',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.notifications_none_rounded),
              activeIcon: Icon(Icons.notifications_rounded),
              label: 'Notifikasi',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Profil',
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/input-incident'),
        backgroundColor: const Color(0xFF0284C7),
        elevation: 3,
        child: const Icon(Icons.add, color: Colors.white, size: 28),
      ),
    );
  }

  Widget _buildIncidentCard(IncidentModel item) {
    final status = item.status.toUpperCase();

    Color statusBadgeColor;
    Color statusTextColor;
    IconData leadingIcon;
    Color leadingColor;
    Color leadingBgColor;

    if (status == 'OPEN') {
      statusBadgeColor = const Color(0xFFEF4444);
      statusTextColor = Colors.white;
      leadingIcon = Icons.warning_rounded;
      leadingColor = const Color(0xFFEF4444);
      leadingBgColor = const Color(0xFFFEE2E2);
    } else if (status == 'PROCESS') {
      statusBadgeColor = const Color(0xFFF59E0B);
      statusTextColor = Colors.white;
      leadingIcon = Icons.schedule_rounded;
      leadingColor = const Color(0xFFD97706);
      leadingBgColor = const Color(0xFFFEF3C7);
    } else {
      // CLOSED
      statusBadgeColor = const Color(0xFF10B981);
      statusTextColor = Colors.white;
      leadingIcon = Icons.check_circle_rounded;
      leadingColor = const Color(0xFF059669);
      leadingBgColor = const Color(0xFFDCFCE7);
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.neutral200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Status Icon Indicator
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: leadingBgColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Icon(leadingIcon, color: leadingColor, size: 22),
              ),
            ),
            const SizedBox(width: 12),

            // Content Column
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Row with Date and Status Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        item.dateTime,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: AppColors.neutral500,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusBadgeColor,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          item.status,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: statusTextColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Equipment & Incident Title
                  Text(
                    item.incidentType,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 2),

                  // Subtitle / Description
                  Text(
                    item.description,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                      color: AppColors.neutral700,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
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
