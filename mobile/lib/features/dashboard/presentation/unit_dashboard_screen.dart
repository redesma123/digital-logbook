import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../home/presentation/widgets/home_bottom_nav.dart';

class UnitDashboardScreen extends ConsumerStatefulWidget {
  const UnitDashboardScreen({super.key});

  @override
  ConsumerState<UnitDashboardScreen> createState() => _UnitDashboardScreenState();
}

class _UnitDashboardScreenState extends ConsumerState<UnitDashboardScreen> {
  String _selectedRange = '7 Hari Terakhir';
  int _selectedMetricTab = 0; // 0: Daya, 1: Debit, 2: Efisiensi
  int _selectedPeriod = 0; // 0: Harian, 1: Bulanan, 2: Tahunan

  final List<String> _dateLabels = ['6 Apr', '7 Apr', '8 Apr', '9 Apr', '10 Apr', '11 Apr', '12 Apr'];

  // Trend Data for 7 days
  final List<double> _powerValues = [380, 420, 395, 430, 470, 440, 450]; // kW
  final List<double> _flowValues = [2.2, 2.4, 2.1, 2.4, 2.6, 2.5, 2.5]; // m3/s
  final List<double> _efficiencyValues = [82, 85, 83, 86, 89, 87, 88]; // %

  // Energy Production Data for 7 days
  final List<double> _energyValues = [3900, 4150, 4000, 4320, 4600, 4180, 4250]; // kWh

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
    String currentMetricTitle = 'Daya Aktif (kW)';
    String currentMetricValue = '450 kW';
    String currentMetricTimestamp = '12 Apr 08:00';
    List<double> currentChartValues = _powerValues;
    double maxMetricValue = 600;

    if (_selectedMetricTab == 1) {
      currentMetricTitle = 'Debit Air (m³/s)';
      currentMetricValue = '2.50 m³/s';
      currentMetricTimestamp = '12 Apr 08:00';
      currentChartValues = _flowValues;
      maxMetricValue = 3.0;
    } else if (_selectedMetricTab == 2) {
      currentMetricTitle = 'Efisiensi Turbin (%)';
      currentMetricValue = '88.0 %';
      currentMetricTimestamp = '12 Apr 08:00';
      currentChartValues = _efficiencyValues;
      maxMetricValue = 100;
    }

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
          backgroundColor: const Color(0xFF0284C7),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/home'),
          ),
        title: Text(
          'Dashboard Unit',
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
            // 1. Plant Title & Period Filter Dropdown
            Text(
              'PLTMh Sampean Baru',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.neutral700,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.neutral300),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedRange,
                  isExpanded: true,
                  icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.neutral500),
                  items: const [
                    DropdownMenuItem(value: '7 Hari Terakhir', child: Text('7 Hari Terakhir')),
                    DropdownMenuItem(value: '30 Hari Terakhir', child: Text('30 Hari Terakhir')),
                    DropdownMenuItem(value: 'Bulan Ini', child: Text('Bulan Ini')),
                    DropdownMenuItem(value: 'Tahun Ini', child: Text('Tahun Ini')),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedRange = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 2. Metric Tab Switcher (Daya | Debit | Efisiensi)
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.all(3),
              child: Row(
                children: [
                  _buildTabOption(index: 0, label: 'Daya'),
                  _buildTabOption(index: 1, label: 'Debit'),
                  _buildTabOption(index: 2, label: 'Efisiensi'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 3. Line Chart Card (Daya Aktif / Selected Metric)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.neutral200),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x05000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
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
                        currentMetricTitle,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.neutral900,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              currentMetricValue,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF15803D),
                              ),
                            ),
                            Text(
                              currentMetricTimestamp,
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: const Color(0xFF15803D),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Line Chart Canvas
                  SizedBox(
                    height: 160,
                    width: double.infinity,
                    child: _buildTrendChart(
                      values: currentChartValues,
                      maxValue: maxMetricValue,
                      dates: _dateLabels,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 4. Bar Chart Card (Produksi Energi)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.neutral200),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x05000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
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
                        'Produksi Energi',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.neutral900,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE0F2FE),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '4.250 kWh',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF0369A1),
                              ),
                            ),
                            Text(
                              '12 Apr 2025',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: const Color(0xFF0369A1),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Period Switcher (Harian | Bulanan | Tahunan)
                  Row(
                    children: [
                      _buildPeriodPill(index: 0, label: 'Harian'),
                      const SizedBox(width: 8),
                      _buildPeriodPill(index: 1, label: 'Bulanan'),
                      const SizedBox(width: 8),
                      _buildPeriodPill(index: 2, label: 'Tahunan'),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Bar Chart Canvas
                  SizedBox(
                    height: 160,
                    width: double.infinity,
                    child: _buildEnergyBarChart(
                      values: _energyValues,
                      dates: _dateLabels,
                      maxKwh: 6000,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 1, // Menu tab active
        onTap: _onBottomNavTap,
      ),
    ),
  );
}

  Widget _buildTabOption({required int index, required String label}) {
    final isSelected = _selectedMetricTab == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedMetricTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF0284C7) : Colors.transparent,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : AppColors.neutral700,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPeriodPill({required int index, required String label}) {
    final isSelected = _selectedPeriod == index;

    return GestureDetector(
      onTap: () => setState(() => _selectedPeriod = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0284C7) : AppColors.neutral100,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.neutral700,
          ),
        ),
      ),
    );
  }

  Widget _buildTrendChart({
    required List<double> values,
    required double maxValue,
    required List<String> dates,
  }) {
    return Column(
      children: [
        Expanded(
          child: CustomPaint(
            size: Size.infinite,
            painter: _TrendLinePainter(
              values: values,
              maxValue: maxValue,
              lineColor: const Color(0xFF10B981),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: dates.map((d) {
            return Text(
              d,
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: AppColors.neutral500,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildEnergyBarChart({
    required List<double> values,
    required List<String> dates,
    required double maxKwh,
  }) {
    return Column(
      children: [
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(values.length, (i) {
              final val = values[i];
              final ratio = (val / maxKwh).clamp(0.05, 1.0);
              final isLatest = i == values.length - 1;

              return Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    width: 28,
                    height: 110 * ratio,
                    decoration: BoxDecoration(
                      color: isLatest ? const Color(0xFF0284C7) : const Color(0xFF38BDF8),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                    ),
                  ),
                ],
              );
            }),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: dates.map((d) {
            return Text(
              d,
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: AppColors.neutral500,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _TrendLinePainter extends CustomPainter {
  final List<double> values;
  final double maxValue;
  final Color lineColor;

  _TrendLinePainter({
    required this.values,
    required this.maxValue,
    required this.lineColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (values.length < 2) return;

    final paintLine = Paint()
      ..color = lineColor
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final paintDot = Paint()
      ..color = lineColor
      ..style = PaintingStyle.fill;

    final paintDotWhite = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final paintGrid = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 1.0;

    // Draw horizontal guidelines
    for (int i = 0; i <= 3; i++) {
      final y = size.height * (i / 3);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paintGrid);
    }

    final double stepX = size.width / (values.length - 1);
    final path = Path();
    final List<Offset> points = [];

    for (int i = 0; i < values.length; i++) {
      final double x = i * stepX;
      final double normalizedY = 1.0 - (values[i] / maxValue).clamp(0.0, 1.0);
      final double y = normalizedY * (size.height - 12) + 6;
      points.add(Offset(x, y));

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    // Draw fill below line
    final fillPath = Path.from(path)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lineColor.withValues(alpha: 0.25),
          lineColor.withValues(alpha: 0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paintLine);

    // Draw point markers
    for (final pt in points) {
      canvas.drawCircle(pt, 4.5, paintLine);
      canvas.drawCircle(pt, 3.0, paintDotWhite);
      canvas.drawCircle(pt, 1.5, paintDot);
    }
  }

  @override
  bool shouldRepaint(covariant _TrendLinePainter oldDelegate) {
    return oldDelegate.values != values || oldDelegate.maxValue != maxValue;
  }
}
