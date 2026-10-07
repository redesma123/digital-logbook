import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_url_helper.dart';
import '../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../home/presentation/widgets/home_bottom_nav.dart';
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

  String _formatDisplayDateTime(String isoStr) {
    try {
      final parsed = DateTime.parse(isoStr).toLocal();
      return DateFormat('dd MMM yyyy HH:mm').format(parsed);
    } catch (_) {
      return isoStr;
    }
  }

  void _onBottomNavTap(int index) {
    if (index == 0) {
      context.go('/home');
    } else if (index == 1) {
      MenuHubBottomSheet.show(context);
    } else if (index == 2) {
      context.go('/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(incidentControllerProvider);

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
            'Daftar Gangguan',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.add, color: Colors.white),
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
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
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
            const Divider(height: 1, color: Color(0xFFE2E8F0)),

            // Incident Cards List
            Expanded(
              child: state.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.primary),
                    )
                  : state.incidents.isEmpty
                      ? RefreshIndicator(
                          onRefresh: () => ref.read(incidentControllerProvider.notifier).loadIncidents(),
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
                                        Icons.warning_amber_rounded,
                                        size: 32,
                                        color: Color(0xFF94A3B8),
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Tidak Ada Data Gangguan',
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
                                        'Belum ada laporan kejadian gangguan yang tercatat di database. Tarik ke bawah untuk menyegarkan.',
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
                                      onPressed: () => context.push('/input-incident'),
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
                                        'Lapor Gangguan',
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
                          onRefresh: () => ref.read(incidentControllerProvider.notifier).loadIncidents(),
                          child: ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(
                              parent: BouncingScrollPhysics(),
                            ),
                            padding: const EdgeInsets.all(16),
                            itemCount: state.incidents.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final item = state.incidents[index];
                              return _buildIncidentCard(item);
                            },
                          ),
                        ),
            ),
          ],
        ),
        bottomNavigationBar: HomeBottomNav(
          currentIndex: 1,
          onTap: _onBottomNavTap,
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => context.push('/input-incident'),
          backgroundColor: AppColors.primary,
          elevation: 3,
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
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
      leadingIcon = Icons.error_outline_rounded;
      leadingColor = const Color(0xFFEF4444);
      leadingBgColor = const Color(0xFFFEE2E2);
    } else if (status == 'PROCESS') {
      statusBadgeColor = const Color(0xFFF59E0B);
      statusTextColor = Colors.white;
      leadingIcon = Icons.hourglass_top_rounded;
      leadingColor = const Color(0xFFD97706);
      leadingBgColor = const Color(0xFFFEF3C7);
    } else {
      // CLOSED
      statusBadgeColor = const Color(0xFF10B981);
      statusTextColor = Colors.white;
      leadingIcon = Icons.check_circle_outline_rounded;
      leadingColor = const Color(0xFF059669);
      leadingBgColor = const Color(0xFFDCFCE7);
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _showIncidentDetailModal(context, item),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: const [
              BoxShadow(
                color: Color(0x05000000),
                blurRadius: 6,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _formatDisplayDateTime(item.dateTime),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF64748B),
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
                      Text(
                        '${item.equipment} - ${item.unitName}',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.neutral900,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.incidentType,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFFDC2626),
                        ),
                      ),
                      if (item.description.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          item.description,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            color: const Color(0xFF475569),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showIncidentDetailModal(BuildContext context, IncidentModel item) {
    final status = item.status.toUpperCase();
    Color statusBadgeColor;
    if (status == 'OPEN') {
      statusBadgeColor = const Color(0xFFEF4444);
    } else if (status == 'PROCESS') {
      statusBadgeColor = const Color(0xFFF59E0B);
    } else {
      statusBadgeColor = const Color(0xFF10B981);
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(ctx).size.height * 0.85,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: statusBadgeColor,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                item.status,
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _formatDisplayDateTime(item.dateTime),
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item.incidentType,
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.neutral900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.neutral500),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            Flexible(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildDetailItem('Unit Pembangkit', item.unitName),
                    const SizedBox(height: 12),
                    _buildDetailItem('Peralatan', item.equipment),
                    const SizedBox(height: 12),
                    _buildDetailItem('Pelapor', item.reporterName),
                    const SizedBox(height: 16),
                    Text(
                      'Deskripsi Kejadian Gangguan',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Text(
                        item.description.isNotEmpty ? item.description : 'Tidak ada rincian keterangan.',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: AppColors.neutral900,
                          height: 1.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Tindakan Awal Operator',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Text(
                        item.operatorAction.isNotEmpty ? item.operatorAction : 'Belum ada tindakan tercatat.',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: AppColors.neutral900,
                          height: 1.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Lampiran Foto',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (item.photos.isNotEmpty)
                      SizedBox(
                        height: 90,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: item.photos.length,
                          separatorBuilder: (context, index) => const SizedBox(width: 8),
                          itemBuilder: (context, idx) {
                            final rawUrl = item.photos[idx];
                            final pUrl = ApiUrlHelper.resolvePhotoUrl(rawUrl);
                            return Container(
                              width: 90,
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: pUrl.startsWith('http')
                                  ? Image.network(pUrl, fit: BoxFit.cover)
                                  : const Center(child: Icon(Icons.image, color: Colors.white54)),
                            );
                          },
                        ),
                      )
                    else
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Text(
                          'Tidak ada lampiran foto.',
                          style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                        ),
                      ),
                    const SizedBox(height: 24),

                    // Action Button to Advance Status
                    if (status == 'OPEN')
                      SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: ElevatedButton(
                          onPressed: () async {
                            Navigator.pop(ctx);
                            await ref.read(incidentControllerProvider.notifier).updateIncidentStatus(item.id, 'PROCESS');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF59E0B),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: Text(
                            'Tangani Gangguan (Set Process)',
                            style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white),
                          ),
                        ),
                      )
                    else if (status == 'PROCESS')
                      SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: ElevatedButton(
                          onPressed: () async {
                            Navigator.pop(ctx);
                            await ref.read(incidentControllerProvider.notifier).updateIncidentStatus(item.id, 'CLOSED');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: Text(
                            'Tutup Kasus Gangguan (Set Closed)',
                            style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white),
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF64748B)),
        ),
        Text(
          value,
          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral900),
        ),
      ],
    );
  }
}
