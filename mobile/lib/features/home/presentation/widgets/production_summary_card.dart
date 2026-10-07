import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';

class ProductionSummaryCard extends StatelessWidget {
  final double productionKwh;
  final double percentageChange;

  const ProductionSummaryCard({
    super.key,
    this.productionKwh = 0.0,
    this.percentageChange = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    final formattedValue = productionKwh >= 1000
        ? '${(productionKwh / 1000).toStringAsFixed(3).replaceAll('.', ',')} kWh'
        : '${productionKwh.toStringAsFixed(0)} kWh';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
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
          Text(
            'Produksi Hari Ini',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.neutral700,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Value with lightning icon
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF9C3), // Amber 100
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.bolt_rounded,
                      color: Color(0xFFEAB308), // Amber 500
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    formattedValue,
                    style: GoogleFonts.inter(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                      color: AppColors.neutral900,
                    ),
                  ),
                ],
              ),

              // Percentage Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.statusRunningBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.arrow_upward_rounded,
                      size: 13,
                      color: AppColors.statusRunningText,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      '+${percentageChange.toStringAsFixed(0)}% ',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.statusRunningText,
                      ),
                    ),
                    Text(
                      'dibanding kemarin',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w400,
                        color: AppColors.statusRunningText,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
