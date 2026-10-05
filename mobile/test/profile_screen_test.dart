import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/profile/presentation/profile_screen.dart';

void main() {
  testWidgets('ProfileScreen displays all UI elements matching Screen 12 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: ProfileScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // App Bar
    expect(find.text('Profil & Pengaturan'), findsOneWidget);

    // Profile card info
    expect(find.text('Andi Pratama'), findsOneWidget);
    expect(find.text('Operator'), findsOneWidget);
    expect(find.text('PLTMh Sampean Baru'), findsOneWidget);

    // Menu options
    expect(find.text('Ubah Password'), findsOneWidget);
    expect(find.text('Pengaturan Notifikasi'), findsOneWidget);
    expect(find.text('Sinkronisasi Data'), findsOneWidget);
    expect(find.text('Tentang Aplikasi'), findsOneWidget);
    expect(find.text('HYDRO-MON v1.0.0'), findsOneWidget);
    expect(find.text('Bantuan'), findsOneWidget);

    // Logout action button
    expect(find.text('Keluar'), findsOneWidget);

    // Bottom Navigation Bar
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Logbook'), findsOneWidget);
    expect(find.text('Menu'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });

  testWidgets('ProfileScreen tapping Keluar opens confirmation dialog', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: ProfileScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final keluarFinder = find.text('Keluar');
    await tester.ensureVisible(keluarFinder);
    await tester.pumpAndSettle();
    await tester.tap(keluarFinder);
    await tester.pumpAndSettle();

    expect(find.text('Konfirmasi Keluar'), findsOneWidget);
    expect(find.text('Apakah Anda yakin ingin keluar dari aplikasi HYDRO-MON?'), findsOneWidget);
    expect(find.text('Batal'), findsOneWidget);

    // Dismiss dialog
    await tester.tap(find.text('Batal'));
    await tester.pumpAndSettle();

    expect(find.text('Konfirmasi Keluar'), findsNothing);
  });
}
