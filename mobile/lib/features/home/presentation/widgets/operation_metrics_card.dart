import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';

class OperationMetricsCard extends StatelessWidget {
  final double activePower; // kW
  final double frequency; // Hz
  final double voltage; // V
  final double current; // A

  const OperationMetricsCard({
    super.key,
    this.activePower = 450.0,
    this.frequency = 50.0,
    this.voltage = 400.0,
    this.current = 820.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Parameter Operasi',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.neutral700,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primaryBackground,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Real-time',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 2x2 Grid Layout
          Row(
            children: [
              Expanded(
                child: _buildMetricItem(
                  label: 'Daya Aktif',
                  value: activePower.toStringAsFixed(0),
                  unit: 'kW',
                  color: AppColors.neutral900,
                ),
              ),
              Container(
                width: 1,
                height: 48,
                color: const Color(0xFFF1F5F9),
              ),
              Expanded(
                child: _buildMetricItem(
                  label: 'Frekuensi',
                  value: frequency.toStringAsFixed(1),
                  unit: 'Hz',
                  color: AppColors.neutral900,
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: Divider(color: Color(0xFFF1F5F9), thickness: 1),
          ),
          Row(
            children: [
              Expanded(
                child: _buildMetricItem(
                  label: 'Tegangan',
                  value: voltage.toStringAsFixed(0),
                  unit: 'V',
                  color: AppColors.neutral900,
                ),
              ),
              Container(
                width: 1,
                height: 48,
                color: const Color(0xFFF1F5F9),
              ),
              Expanded(
                child: _buildMetricItem(
                  label: 'Arus',
                  value: current.toStringAsFixed(0),
                  unit: 'A',
                  color: AppColors.neutral900,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricItem({
    required String label,
    required String value,
    required String unit,
    required Color color,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: GoogleFonts.inter(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: color,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                unit,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
