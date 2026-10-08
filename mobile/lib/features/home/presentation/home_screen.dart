import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../../../core/widgets/notification_bottom_sheet.dart';
import '../../dashboard/presentation/controllers/dashboard_controller.dart';
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
    await ref.read(dashboardControllerProvider.notifier).refresh();
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
      context.go('/history-logbook');
    } else if (route == '/gangguan') {
      context.go('/incidents');
    } else if (route == '/maintenance') {
      context.go('/maintenance');
    } else if (route == '/inspeksi') {
      context.go('/inspeksi');
    } else if (route == '/laporan') {
      context.go('/unit-dashboard');
    } else if (route == '/lainnya') {
      context.go('/lainnya');
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashState = ref.watch(dashboardControllerProvider);
    final summary = dashState.summary;

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: HomeHeader(
        onNotificationTap: () => NotificationBottomSheet.show(context),
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
              InkWell(
                onTap: () => context.push('/unit-dashboard'),
                borderRadius: BorderRadius.circular(12),
                child: UnitStatusCard(
                  unitName: summary?.unitName ?? 'PLTMH Sampean Baru',
                  status: summary?.unitStatus ?? 'RUNNING',
                  runningSince: summary?.lastRecordedAt ?? 'Standby Telemetri',
                ),
              ),
              const SizedBox(height: 16),

              // 2. Real-time Operation Metrics Grid
              OperationMetricsCard(
                activePower: summary?.activePowerKw ?? 0.0,
                frequency: summary?.frequencyHz ?? 0.0,
                voltage: summary?.voltageV ?? 0.0,
                current: summary?.currentA ?? 0.0,
              ),
              const SizedBox(height: 20),

              // 3. Quick Action Grid (Logbook, Maintenance, Gangguan, Inspeksi, Laporan, Lainnya)
              QuickActionsGrid(
                onActionTap: _handleQuickAction,
              ),
              const SizedBox(height: 20),

              // 4. Daily Production Summary Card
              InkWell(
                onTap: () => context.push('/unit-dashboard'),
                borderRadius: BorderRadius.circular(12),
                child: ProductionSummaryCard(
                  productionKwh: summary?.todayEnergyKwh ?? 0.0,
                  percentageChange: 0.0,
                ),
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
            MenuHubBottomSheet.show(context);
          } else if (index == 2) {
            context.go('/profile');
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
