import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../home/presentation/widgets/home_bottom_nav.dart';
import '../domain/logbook_model.dart';
import 'controllers/logbook_controller.dart';

class HistoryLogbookScreen extends ConsumerWidget {
  const HistoryLogbookScreen({super.key});

  Color _getStatusDotColor(String status) {
    switch (status.toLowerCase()) {
      case 'running':
        return AppColors.statusRunning;
      case 'standby':
        return AppColors.statusStandby;
      case 'trip':
        return AppColors.statusTrip;
      case 'shutdown':
      default:
        return AppColors.statusOffline;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(logbookControllerProvider);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          context.go('/home');
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.surfacePage,
        appBar: AppBar(
          backgroundColor: const Color(0xFF0F265C),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/home'),
          ),
        title: Text(
          'Histori Logbook',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            tooltip: 'Input Logbook',
            onPressed: () => context.push('/input-logbook'),
          ),
        ],
        centerTitle: false,
        elevation: 0,
      ),
      body: Column(
        children: [
          // 1. Date Range Filter
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    state.dateFilter,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.neutral900,
                    ),
                  ),
                  Image.asset(
                    AppAssets.icCalendar,
                    width: 18,
                    height: 18,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),
          ),

          // 2. Table Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF1F5F9),
              border: Border(
                bottom: BorderSide(color: Color(0xFFE2E8F0)),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 4,
                  child: Text(
                    'Tanggal',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF475569)),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Shift',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF475569)),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Text(
                    'Daya (kW)',
                    textAlign: TextAlign.right,
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF475569)),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Status',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF475569)),
                  ),
                ),
              ],
            ),
          ),

          // 3. Entries List
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : state.entries.isEmpty
                    ? Center(
                        child: Text(
                          'Belum ada data logbook',
                          style: GoogleFonts.inter(color: AppColors.neutral500),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => ref.read(logbookControllerProvider.notifier).loadHistory(),
                        child: ListView.separated(
                          physics: const AlwaysScrollableScrollPhysics(
                            parent: BouncingScrollPhysics(),
                          ),
                          itemCount: state.entries.length,
                          separatorBuilder: (context, index) => const Divider(
                            height: 1,
                            color: Color(0xFFF1F5F9),
                          ),
                          itemBuilder: (context, index) {
                            final item = state.entries[index];
                            return _buildListRow(context, ref, item);
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/input-logbook'),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(
          'Input Logbook',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 1, // Menu tab active
        onTap: (idx) {
          if (idx == 0) {
            context.go('/home');
          } else if (idx == 1) {
            MenuHubBottomSheet.show(context);
          } else if (idx == 2) {
            context.go('/profile');
          }
        },
      ),
    ),
  );
}

  Widget _buildListRow(BuildContext context, WidgetRef ref, LogbookModel item) {
    return InkWell(
      onTap: () {
        ref.read(logbookControllerProvider.notifier).selectEntry(item);
        context.push('/detail-logbook');
      },
      child: Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            // Tanggal & Jam
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.date,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.neutral900,
                    ),
                  ),
                  Text(
                    item.time,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),

            // Shift
            Expanded(
              flex: 2,
              child: Text(
                item.shift,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.neutral700,
                ),
              ),
            ),

            // Daya (kW)
            Expanded(
              flex: 3,
              child: Text(
                item.activePower.toStringAsFixed(0),
                textAlign: TextAlign.right,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.neutral900,
                ),
              ),
            ),

            // Status Dot
            Expanded(
              flex: 2,
              child: Center(
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: _getStatusDotColor(item.unitStatus),
                    shape: BoxShape.circle,
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
