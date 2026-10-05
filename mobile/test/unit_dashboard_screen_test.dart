import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/dashboard/presentation/unit_dashboard_screen.dart';

void main() {
  testWidgets('UnitDashboardScreen displays all elements matching Screen 11 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: UnitDashboardScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // App Bar & Header
    expect(find.text('Dashboard Unit'), findsOneWidget);
    expect(find.text('PLTMh Sampean Baru'), findsOneWidget);
    expect(find.text('7 Hari Terakhir'), findsOneWidget);

    // Metric Tabs
    expect(find.text('Daya'), findsOneWidget);
    expect(find.text('Debit'), findsOneWidget);
    expect(find.text('Efisiensi'), findsOneWidget);

    // Initial Line Chart values
    expect(find.text('Daya Aktif (kW)'), findsOneWidget);
    expect(find.text('450 kW'), findsOneWidget);

    // Bar Chart card & Period pills
    expect(find.text('Produksi Energi'), findsOneWidget);
    expect(find.text('4.250 kWh'), findsOneWidget);
    expect(find.text('12 Apr 2025'), findsOneWidget);
    expect(find.text('Harian'), findsOneWidget);
    expect(find.text('Bulanan'), findsOneWidget);
    expect(find.text('Tahunan'), findsOneWidget);

    // Bottom Navigation Bar
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Menu'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });

  testWidgets('UnitDashboardScreen allows switching metric tabs', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: UnitDashboardScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Switch to Debit tab
    await tester.tap(find.text('Debit'));
    await tester.pumpAndSettle();

    expect(find.text('Debit Air (m³/s)'), findsOneWidget);
    expect(find.text('2.50 m³/s'), findsOneWidget);

    // Switch to Efisiensi tab
    await tester.tap(find.text('Efisiensi'));
    await tester.pumpAndSettle();

    expect(find.text('Efisiensi Turbin (%)'), findsOneWidget);
    expect(find.text('88.0 %'), findsOneWidget);
  });

  testWidgets('UnitDashboardScreen allows switching production period pills', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: UnitDashboardScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Switch to Bulanan
    final bulananFinder = find.text('Bulanan');
    await tester.ensureVisible(bulananFinder);
    await tester.tap(bulananFinder);
    await tester.pumpAndSettle();

    // Switch to Tahunan
    final tahunanFinder = find.text('Tahunan');
    await tester.ensureVisible(tahunanFinder);
    await tester.tap(tahunanFinder);
    await tester.pumpAndSettle();
  });
}
