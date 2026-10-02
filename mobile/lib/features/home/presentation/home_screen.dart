import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import 'widgets/home_header.dart';
import 'widgets/unit_status_card.dart';
import 'widgets/operation_metrics_card.dart';
import 'widgets/quick_actions_grid.dart';
import 'widgets/production_summary_card.dart';
import 'widgets/home_bottom_nav.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _currentNavIndex = 0;

  Future<void> _handleRefresh() async {
    // Simulated refresh for real-time monitoring metrics
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Data operasional berhasil diperbarui'),
          duration: Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _handleQuickAction(String route) {
    if (route == '/logbook') {
      context.push('/history-logbook');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Membuka menu: $route'),
          duration: const Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: HomeHeader(
        onNotificationTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Tidak ada notifikasi baru'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        },
      ),
      body: RefreshIndicator(
        onRefresh: _handleRefresh,
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Unit Status Card (Live Running Status)
              const UnitStatusCard(
                unitName: 'PLTMH Sampean Baru',
                status: 'RUNNING',
                runningSince: '12 Apr 2025 06:30',
              ),
              const SizedBox(height: 16),

              // 2. Real-time Operation Metrics Grid (450 kW, 50 Hz, 400 V, 820 A)
              const OperationMetricsCard(
                activePower: 450,
                frequency: 50.0,
                voltage: 400,
                current: 820,
              ),
              const SizedBox(height: 20),

              // 3. Quick Action Grid (Logbook, Maintenance, Gangguan, Inspeksi, Laporan, Lainnya)
              QuickActionsGrid(
                onActionTap: _handleQuickAction,
              ),
              const SizedBox(height: 20),

              // 4. Daily Production Summary Card (4.250 kWh, +12% dibanding kemarin)
              const ProductionSummaryCard(
                productionKwh: 4250.0,
                percentageChange: 12.0,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: _currentNavIndex,
        onTap: (index) {
          if (index == 1) {
            context.push('/history-logbook');
          } else {
            setState(() {
              _currentNavIndex = index;
            });
          }
        },
      ),
    );
  }
}
