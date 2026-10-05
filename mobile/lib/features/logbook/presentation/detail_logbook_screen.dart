import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/constants/app_colors.dart';
import 'controllers/logbook_controller.dart';

class DetailLogbookScreen extends ConsumerWidget {
  const DetailLogbookScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(logbookControllerProvider);
    final entry = state.selectedEntry ?? (state.entries.isNotEmpty ? state.entries.first : null);

    if (entry == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Detail Logbook')),
        body: const Center(child: Text('Data logbook tidak ditemukan')),
      );
    }

    Color statusBadgeBg;
    Color statusBadgeDot;
    Color statusBadgeText;
    switch (entry.unitStatus.toLowerCase()) {
      case 'running':
        statusBadgeBg = AppColors.statusRunningBg;
        statusBadgeDot = AppColors.statusRunning;
        statusBadgeText = AppColors.statusRunningText;
        break;
      case 'standby':
        statusBadgeBg = AppColors.statusStandbyBg;
        statusBadgeDot = AppColors.statusStandby;
        statusBadgeText = AppColors.statusStandbyText;
        break;
      case 'trip':
        statusBadgeBg = AppColors.statusTripBg;
        statusBadgeDot = AppColors.statusTrip;
        statusBadgeText = AppColors.statusTripText;
        break;
      case 'shutdown':
      default:
        statusBadgeBg = AppColors.statusOfflineBg;
        statusBadgeDot = AppColors.statusOffline;
        statusBadgeText = AppColors.statusOfflineText;
        break;
    }

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F265C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/history-logbook'),
        ),
        title: Text(
          'Detail Logbook',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        centerTitle: false,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Header Card (Date, Shift, Status, Operator)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${entry.date} - ${entry.time}',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.neutral900,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusBadgeBg,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: statusBadgeDot,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              entry.unitStatus,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: statusBadgeText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Color(0xFFF1F5F9), thickness: 1),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Operator',
                              style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              entry.operatorName,
                              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral900),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Shift',
                              style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              entry.shift,
                              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral900),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 2. Hour Meter (Operan Shift)
            if (entry.hourMeterStart != null || entry.hourMeterEnd != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hour Meter (Operan Shift)',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.neutral900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildDetailRow(
                      'HM Awal',
                      entry.hourMeterStart != null ? '${entry.hourMeterStart!.toStringAsFixed(1)} jam' : '-',
                    ),
                    _buildDetailRow(
                      'HM Akhir',
                      entry.hourMeterEnd != null ? '${entry.hourMeterEnd!.toStringAsFixed(1)} jam' : '-',
                    ),
                    _buildDetailRow(
                      'Jam Operasi Shift',
                      entry.runningHours != null ? '${entry.runningHours!.toStringAsFixed(1)} jam' : '-',
                      isLast: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 3. Parameter Operasi Detail Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Parameter Operasi',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow('Tegangan', '${entry.voltage.toStringAsFixed(0)} V'),
                  _buildDetailRow('Arus', '${entry.current.toStringAsFixed(0)} A'),
                  _buildDetailRow('Frekuensi', '${entry.frequency.toStringAsFixed(1)} Hz'),
                  _buildDetailRow('Daya Aktif', '${entry.activePower.toStringAsFixed(0)} kW'),
                  _buildDetailRow('Faktor Daya', entry.powerFactor.toStringAsFixed(2)),
                  _buildDetailRow('Debit Air', '${entry.flowRate.toStringAsFixed(2)} m³/s'),
                  _buildDetailRow('Tinggi Muka Air', '${entry.waterLevel.toStringAsFixed(2)} m'),
                  _buildDetailRow('Suhu Bearing', '${entry.bearingTemp.toStringAsFixed(0)} °C', isLast: true),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 3. Catatan Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Catatan',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    entry.notes.isNotEmpty ? entry.notes : 'Tidak ada catatan.',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                      color: const Color(0xFF475569),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 4. Foto Dokumentasi Section
            Text(
              'Foto',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.neutral900,
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 100,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _buildPhotoThumbnail(Icons.power_rounded, 'Generator'),
                  const SizedBox(width: 10),
                  _buildPhotoThumbnail(Icons.speed_rounded, 'Pressure Gauge'),
                  const SizedBox(width: 10),
                  _buildPhotoThumbnail(Icons.water_drop_rounded, 'Turbin Saluran'),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // 5. Edit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () {
                  context.push('/input-logbook');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                icon: Image.asset(
                  AppAssets.icEdit,
                  width: 18,
                  height: 18,
                  color: Colors.white,
                ),
                label: Text(
                  'Edit',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isLast = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF64748B),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.neutral900,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoThumbnail(IconData icon, String caption) {
    return Container(
      width: 110,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B), // Dark slate industrial preview
        borderRadius: BorderRadius.circular(10),
      ),
      child: Stack(
        children: [
          Center(
            child: Icon(icon, color: const Color(0xFF38BDF8), size: 36),
          ),
          Positioned(
            left: 6,
            right: 6,
            bottom: 6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                caption,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 9,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
