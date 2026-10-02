import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/splash/presentation/splash_screen.dart';

void main() {
  testWidgets('SplashScreen displays brand and plant details', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: SplashScreen(),
        ),
      ),
    );

    expect(find.text('HYDRO-MON'), findsOneWidget);
    expect(find.text('Digital Logbook & Monitoring'), findsOneWidget);
    expect(find.text('PLTMh Sampean Baru'), findsOneWidget);
    expect(find.text('Energi Air'), findsOneWidget);
    expect(find.text('untuk Masa Depan\nyang Berkelanjutan'), findsOneWidget);
  });
}
