import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('HydroMonApp builds and renders initial route', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: HydroMonApp(),
      ),
    );

    expect(find.text('HYDRO-MON Splash'), findsOneWidget);
  });
}
