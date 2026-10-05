import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/logbook/presentation/input_logbook_screen.dart';
import 'package:mobile/features/logbook/presentation/detail_logbook_screen.dart';
import 'package:mobile/features/logbook/presentation/history_logbook_screen.dart';

void main() {
  testWidgets('InputLogbookScreen displays all input fields matching Screen 4 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: InputLogbookScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Input Logbook'), findsOneWidget);
    expect(find.text('Tanggal'), findsOneWidget);
    expect(find.text('Shift'), findsOneWidget);
    expect(find.text('Pagi'), findsOneWidget);
    expect(find.text('Siang'), findsOneWidget);
    expect(find.text('Malam'), findsOneWidget);
    expect(find.text('Parameter Operasi'), findsOneWidget);
    expect(find.text('Hour Meter (Operan Shift)'), findsOneWidget);
    expect(find.text('HM Awal (jam)'), findsOneWidget);
    expect(find.text('HM Akhir (jam)'), findsOneWidget);
    expect(find.text('Jam Operasi'), findsOneWidget);
    expect(find.text('Running'), findsOneWidget);
    expect(find.text('Standby'), findsOneWidget);
    expect(find.text('Shutdown'), findsOneWidget);
    expect(find.text('Trip'), findsOneWidget);
    expect(find.text('Simpan Logbook'), findsOneWidget);
  });

  testWidgets('DetailLogbookScreen displays logbook metrics matching Screen 5 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: DetailLogbookScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Detail Logbook'), findsOneWidget);
    expect(find.text('Hour Meter (Operan Shift)'), findsOneWidget);
    expect(find.text('HM Awal'), findsOneWidget);
    expect(find.text('HM Akhir'), findsOneWidget);
    expect(find.text('Jam Operasi Shift'), findsOneWidget);
    expect(find.text('Parameter Operasi'), findsOneWidget);
    expect(find.text('Operator'), findsOneWidget);
    expect(find.text('Shift'), findsOneWidget);
    expect(find.text('Catatan'), findsOneWidget);
    expect(find.text('Edit'), findsOneWidget);
  });

  testWidgets('HistoryLogbookScreen displays history list matching Screen 6 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: HistoryLogbookScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Histori Logbook'), findsOneWidget);
    expect(find.text('01 Apr 2025 - 30 Apr 2025'), findsOneWidget);
    expect(find.text('Tanggal'), findsOneWidget);
    expect(find.text('Shift'), findsOneWidget);
    expect(find.text('Daya (kW)'), findsOneWidget);
    expect(find.text('Status'), findsOneWidget);
    expect(find.text('Input Logbook'), findsOneWidget);

    // Bottom Navigation Bar tabs (Screen 6)
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Logbook'), findsOneWidget);
    expect(find.text('Menu'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });
}
