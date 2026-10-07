import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_url_helper.dart';
import 'controllers/logbook_controller.dart';

class DetailLogbookScreen extends ConsumerWidget {
  const DetailLogbookScreen({super.key});

  String _formatDisplayDate(String isoDate) {
    try {
      final parsed = DateTime.parse(isoDate);
      return DateFormat('dd MMM yyyy').format(parsed);
    } catch (_) {
      return isoDate;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(logbookControllerProvider);
    final entry = state.selectedEntry;

    if (entry == null) {
      return Scaffold(
        backgroundColor: AppColors.surfacePage,
        appBar: AppBar(
          backgroundColor: const Color(0xFF0F265C),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/history-logbook'),
          ),
          title: Text(
            'Detail Logbook',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.info_outline, size: 48, color: Color(0xFF94A3B8)),
              const SizedBox(height: 12),
              Text(
                'Data logbook tidak ditemukan',
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.neutral700),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go('/history-logbook'),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                child: const Text('Kembali ke Histori', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }

    Color statusBadgeBg;
    Color statusBadgeDot;
    Color statusBadgeText;
    switch (entry.unitStatus.toUpperCase()) {
      case 'RUNNING':
        statusBadgeBg = AppColors.statusRunningBg;
        statusBadgeDot = AppColors.statusRunning;
        statusBadgeText = AppColors.statusRunningText;
        break;
      case 'STANDBY':
        statusBadgeBg = AppColors.statusStandbyBg;
        statusBadgeDot = AppColors.statusStandby;
        statusBadgeText = AppColors.statusStandbyText;
        break;
      case 'TRIP':
        statusBadgeBg = AppColors.statusTripBg;
        statusBadgeDot = AppColors.statusTrip;
        statusBadgeText = AppColors.statusTripText;
        break;
      case 'OFFLINE':
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
            // 1. Header Card (Date, Shift, Status, Unit, Operator)
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
                      Expanded(
                        child: Text(
                          '${_formatDisplayDate(entry.date)} - ${entry.time}',
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.neutral900,
                          ),
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
                              'Unit Pembangkit',
                              style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              entry.unitName,
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

            // 2. Hour Meter (Operan Shift) & Produksi Energi
            if (entry.hourMeterStart != null || entry.hourMeterEnd != null || entry.energyProductionKwh != null) ...[
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
                      'Hour Meter & Energi',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.neutral900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (entry.hourMeterStart != null)
                      _buildDetailRow('HM Awal', '${entry.hourMeterStart!.toStringAsFixed(1)} jam'),
                    if (entry.hourMeterEnd != null)
                      _buildDetailRow('HM Akhir', '${entry.hourMeterEnd!.toStringAsFixed(1)} jam'),
                    if (entry.runningHours != null)
                      _buildDetailRow('Jam Operasi Shift', '${entry.runningHours!.toStringAsFixed(1)} jam'),
                    if (entry.energyProductionKwh != null)
                      _buildDetailRow('Produksi Energi', '${entry.energyProductionKwh!.toStringAsFixed(1)} kWh', isLast: true)
                    else if (entry.runningHours != null && entry.activePower > 0)
                      _buildDetailRow('Estimasi Produksi Energi', '${(entry.activePower * entry.runningHours!).toStringAsFixed(1)} kWh', isLast: true),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 3. Parameter Elektrikal
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
                    'Parameter Elektrikal',
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
                  _buildDetailRow('Faktor Daya (Cos Phi)', entry.powerFactor.toStringAsFixed(2)),
                  if (entry.reactivePowerKvar != null)
                    _buildDetailRow('Daya Reaktif', '${entry.reactivePowerKvar!.toStringAsFixed(1)} kVAR'),
                  if (entry.generatorStatus != null && entry.generatorStatus!.isNotEmpty)
                    _buildDetailRow('Status Generator', entry.generatorStatus!, isLast: true)
                  else
                    const SizedBox.shrink(),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 4. Parameter Hidrolik
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
                    'Parameter Hidrolik',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow('Debit Air', '${entry.flowRate.toStringAsFixed(2)} m³/s'),
                  _buildDetailRow('Tinggi Muka Air (TMA)', '${entry.waterLevel.toStringAsFixed(2)} m'),
                  if (entry.headM != null)
                    _buildDetailRow('Head Efektif', '${entry.headM!.toStringAsFixed(1)} m'),
                  if (entry.pressureBar != null)
                    _buildDetailRow('Tekanan Penstock', '${entry.pressureBar!.toStringAsFixed(2)} bar'),
                  if (entry.intakeCondition != null && entry.intakeCondition!.isNotEmpty)
                    _buildDetailRow('Kondisi Intake', entry.intakeCondition!, isLast: true)
                  else
                    const SizedBox.shrink(),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 5. Parameter Mekanikal
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
                    'Parameter Mekanikal',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow('Suhu Bearing', '${entry.bearingTemp.toStringAsFixed(0)} °C'),
                  if (entry.rpm != null)
                    _buildDetailRow('Putaran (RPM)', '${entry.rpm!.toStringAsFixed(0)} rpm'),
                  if (entry.generatorTemp != null)
                    _buildDetailRow('Suhu Generator', '${entry.generatorTemp!.toStringAsFixed(0)} °C'),
                  if (entry.turbineTemp != null)
                    _buildDetailRow('Suhu Turbin', '${entry.turbineTemp!.toStringAsFixed(0)} °C'),
                  if (entry.vibrationMms != null)
                    _buildDetailRow('Vibrasi', '${entry.vibrationMms!.toStringAsFixed(2)} mm/s', isLast: true)
                  else
                    const SizedBox.shrink(),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 6. Catatan Card
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
                    'Catatan Operasi',
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

            // 7. Foto Dokumentasi Section
            Text(
              'Foto Dokumentasi',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.neutral900,
              ),
            ),
            const SizedBox(height: 8),
            if (entry.photos.isNotEmpty)
              SizedBox(
                height: 100,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: entry.photos.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 10),
                  itemBuilder: (context, idx) {
                    final photoItem = entry.photos[idx];
                    return _buildPhotoItem(photoItem, idx + 1);
                  },
                ),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(
                  'Tidak ada lampiran foto dokumentasi.',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: const Color(0xFF64748B),
                  ),
                ),
              ),
            const SizedBox(height: 28),

            // 8. Tombol Kembali
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: () => context.canPop() ? context.pop() : context.go('/history-logbook'),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFCBD5E1)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: Text(
                  'Kembali ke Histori',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.neutral900,
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

  Widget _buildPhotoItem(String photoUrl, int index) {
    final resolvedUrl = ApiUrlHelper.resolvePhotoUrl(photoUrl);
    final bool isNetwork = resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://');

    return Container(
      width: 110,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (isNetwork)
            Image.network(
              resolvedUrl,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const Center(
                child: Icon(Icons.broken_image, color: Color(0xFF94A3B8), size: 28),
              ),
            )
          else
            const Center(
              child: Icon(Icons.image_outlined, color: Color(0xFF38BDF8), size: 32),
            ),
          Positioned(
            left: 4,
            right: 4,
            bottom: 4,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Foto #$index',
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
