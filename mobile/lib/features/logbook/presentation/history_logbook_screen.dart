import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../home/presentation/widgets/home_bottom_nav.dart';
import '../domain/logbook_model.dart';
import 'controllers/logbook_controller.dart';

class HistoryLogbookScreen extends ConsumerWidget {
  const HistoryLogbookScreen({super.key});

  Color _getStatusDotColor(String status) {
    switch (status.toUpperCase()) {
      case 'RUNNING':
        return AppColors.statusRunning;
      case 'STANDBY':
        return AppColors.statusStandby;
      case 'TRIP':
        return AppColors.statusTrip;
      case 'OFFLINE':
      default:
        return AppColors.statusOffline;
    }
  }

  String _formatDisplayDate(String isoDate) {
    try {
      final parsed = DateTime.parse(isoDate);
      return DateFormat('dd MMM yyyy').format(parsed);
    } catch (_) {
      return isoDate;
    }
  }

  Future<void> _pickDateRange(BuildContext context, WidgetRef ref, LogbookState state) async {
    final now = DateTime.now();
    final initialRange = (state.fromDate != null && state.toDate != null)
        ? DateTimeRange(start: state.fromDate!, end: state.toDate!)
        : DateTimeRange(
            start: now.subtract(const Duration(days: 30)),
            end: now,
          );

    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
      initialDateRange: initialRange,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: AppColors.neutral900,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      await ref.read(logbookControllerProvider.notifier).setDateRange(picked.start, picked.end);
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
            // 1. Date Range Filter & Shift Selector
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                children: [
                  InkWell(
                    onTap: () => _pickDateRange(context, ref, state),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                      ),
                      child: Row(
                        children: [
                          Image.asset(
                            AppAssets.icCalendar,
                            width: 18,
                            height: 18,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              state.dateFilter,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.neutral900,
                              ),
                            ),
                          ),
                          if (state.fromDate != null)
                            GestureDetector(
                              onTap: () => ref.read(logbookControllerProvider.notifier).setDateRange(null, null),
                              child: const Padding(
                                padding: EdgeInsets.all(2.0),
                                child: Icon(Icons.close, size: 18, color: Color(0xFF64748B)),
                              ),
                            )
                          else
                            const Icon(Icons.keyboard_arrow_down, size: 20, color: Color(0xFF64748B)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Shift Filter Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildShiftFilterChip(ref, label: 'Semua Shift', value: null, selected: state.selectedShift == null),
                        const SizedBox(width: 8),
                        _buildShiftFilterChip(ref, label: 'Pagi', value: 'PAGI', selected: state.selectedShift == 'PAGI'),
                        const SizedBox(width: 8),
                        _buildShiftFilterChip(ref, label: 'Siang', value: 'SIANG', selected: state.selectedShift == 'SIANG'),
                        const SizedBox(width: 8),
                        _buildShiftFilterChip(ref, label: 'Malam', value: 'MALAM', selected: state.selectedShift == 'MALAM'),
                      ],
                    ),
                  ),
                ],
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
                      'Tanggal & Unit',
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

            // 3. Entries List or Empty State
            Expanded(
              child: state.isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : state.entries.isEmpty
                      ? RefreshIndicator(
                          onRefresh: () => ref.read(logbookControllerProvider.notifier).loadHistory(),
                          child: ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.15),
                              Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 64,
                                      height: 64,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF1F5F9),
                                        borderRadius: BorderRadius.circular(32),
                                      ),
                                      child: const Icon(
                                        Icons.description_outlined,
                                        size: 32,
                                        color: Color(0xFF94A3B8),
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Belum Ada Riwayat Logbook',
                                      style: GoogleFonts.inter(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.neutral900,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 40),
                                      child: Text(
                                        'Data logbook operasi dari database belum tersedia. Tarik ke bawah untuk menyegarkan atau tambahkan entri baru.',
                                        textAlign: TextAlign.center,
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w400,
                                          color: const Color(0xFF64748B),
                                          height: 1.4,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 20),
                                    ElevatedButton.icon(
                                      onPressed: () => context.push('/input-logbook'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                      ),
                                      icon: const Icon(Icons.add, color: Colors.white, size: 18),
                                      label: Text(
                                        'Input Logbook Baru',
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
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
          currentIndex: 1,
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

  Widget _buildShiftFilterChip(
    WidgetRef ref, {
    required String label,
    required String? value,
    required bool selected,
  }) {
    return InkWell(
      onTap: () => ref.read(logbookControllerProvider.notifier).setShiftFilter(value),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
            color: selected ? Colors.white : const Color(0xFF475569),
          ),
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
            // Tanggal, Jam & Unit
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _formatDisplayDate(item.date),
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${item.time} | ${item.unitName}',
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
                item.activePower > 0 ? item.activePower.toStringAsFixed(0) : '0',
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
