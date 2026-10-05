import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/other/presentation/other_menu_screen.dart';

void main() {
  testWidgets('OtherMenuScreen displays all operational utility sections and specs', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: OtherMenuScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // App Bar
    expect(find.text('Menu & Utilitas Lainnya'), findsOneWidget);

    // Section headers
    expect(find.text('Standar Operasional Prosedur (SOP)'), findsOneWidget);
    expect(find.text('Kontak Darurat & PIC Lapangan'), findsOneWidget);
    expect(find.text('Spesifikasi Teknis Unit Pembangkit'), findsOneWidget);
    expect(find.text('Informasi Sistem'), findsOneWidget);

    // SOP items
    expect(find.text('SOP 01: Start Unit & Sinkronisasi'), findsOneWidget);
    expect(find.text('SOP 02: Normal Shutdown'), findsOneWidget);
    expect(find.text('SOP 03: Emergency Shutdown (ESD)'), findsOneWidget);

    // Emergency contacts
    expect(find.text('Supervisor Operasi & Shift'), findsOneWidget);
    expect(find.text('Hendra Wijaya'), findsOneWidget);

    // Plant specs
    expect(find.text('Kapasitas Terpasang'), findsOneWidget);
    expect(find.text('1 x 450 kW (0.45 MW)'), findsOneWidget);
    expect(find.text('Tipe Turbin'), findsOneWidget);
    expect(find.text('Kaplan Horizontal Open Pit'), findsOneWidget);

    // Bottom Navigation Bar
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Logbook'), findsOneWidget);
    expect(find.text('Menu'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });

  testWidgets('OtherMenuScreen opens SOP modal when SOP tile is tapped and closes it', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: OtherMenuScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Tap SOP 01
    await tester.tap(find.text('SOP 01: Start Unit & Sinkronisasi'));
    await tester.pumpAndSettle();

    // Verify modal content
    expect(find.text('Periksa level air forebay dan pastikan trash rack bersih.'), findsOneWidget);
    expect(find.text('Tutup'), findsOneWidget);

    // Close modal
    await tester.tap(find.text('Tutup'));
    await tester.pumpAndSettle();

    // Modal closed
    expect(find.text('Periksa level air forebay dan pastikan trash rack bersih.'), findsNothing);
  });
}
