import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/home/presentation/home_screen.dart';

void main() {
  testWidgets('HomeScreen displays all sections matching Screen 3 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: HomeScreen(),
        ),
      ),
    );

    // 1. Header
    expect(find.text('HYDRO-MON'), findsOneWidget);
    expect(find.text('PLTMh Sampean Baru'), findsOneWidget);

    // 2. Unit Status
    expect(find.text('UNIT RUNNING'), findsOneWidget);
    expect(find.text('Sejak 12 Apr 2025 06:30'), findsOneWidget);

    // 3. Operating Parameters
    expect(find.text('Parameter Operasi'), findsOneWidget);
    expect(find.text('Daya Aktif'), findsOneWidget);
    expect(find.text('450'), findsOneWidget);
    expect(find.text('Frekuensi'), findsOneWidget);
    expect(find.text('50.0'), findsOneWidget);
    expect(find.text('Tegangan'), findsOneWidget);
    expect(find.text('400'), findsOneWidget);
    expect(find.text('Arus'), findsOneWidget);
    expect(find.text('820'), findsOneWidget);

    // 4. Quick Actions
    expect(find.text('Logbook'), findsWidgets);
    expect(find.text('Maintenance'), findsOneWidget);
    expect(find.text('Gangguan'), findsOneWidget);
    expect(find.text('Inspeksi'), findsOneWidget);
    expect(find.text('Laporan'), findsOneWidget);
    expect(find.text('Lainnya'), findsOneWidget);

    // 5. Daily Production
    expect(find.text('Produksi Hari Ini'), findsOneWidget);
    expect(find.text('4,250 kWh'), findsOneWidget);
    expect(find.text('+12% '), findsOneWidget);

    // 6. Bottom Navigation
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Notifikasi'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });

  testWidgets('HomeScreen opens NotificationBottomSheet when Notifikasi tab is tapped', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: HomeScreen(),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 300));

    await tester.tap(find.text('Notifikasi'));
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.text('Notifikasi Operasional'), findsOneWidget);
    expect(find.text('ALARM: Generator Unit 1 Trip'), findsOneWidget);
    expect(find.text('Tandai dibaca'), findsOneWidget);

    await tester.tap(find.text('Tandai dibaca'), warnIfMissed: false);
    await tester.pump(const Duration(milliseconds: 300));
  });
}
