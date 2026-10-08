import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/services/image_picker_service.dart';
import 'package:mobile/core/widgets/photo_attachment_section.dart';

void main() {
  group('ImagePickerService Specification Tests (SRS F-31, F-33)', () {
    test('Image compression complies with SRS F-31 specifications (<=1280px, 75% quality)', () {
      expect(ImagePickerService.maxImageDimension, lessThanOrEqualTo(1280.0));
      expect(ImagePickerService.imageCompressionQuality, inInclusiveRange(70, 80));
    });

    test('Max file size limit matches SRS F-33 (5 MB)', () {
      expect(ImagePickerService.maxFileSizeBytes, equals(5 * 1024 * 1024));
    });
  });

  group('PhotoAttachmentSection Widget Tests', () {
    testWidgets('Renders label, count, and add button correctly', (WidgetTester tester) async {
      final List<String> photos = [];

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: PhotoAttachmentSection(
                label: 'Foto Dokumentasi',
                photos: photos,
                onPhotoAdded: (_) {},
                onPhotoRemoved: (_) {},
              ),
            ),
          ),
        ),
      );

      expect(find.text('Foto Dokumentasi'), findsOneWidget);
      expect(find.text('0/5 foto'), findsOneWidget);
      expect(find.text('Tambah'), findsOneWidget);
      expect(find.byIcon(Icons.camera_alt_rounded), findsOneWidget);
    });

    testWidgets('Renders photo count and close button when photos attached', (WidgetTester tester) async {
      final List<String> photos = ['dummy_path.jpg'];
      String? removedPhoto;

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: PhotoAttachmentSection(
                label: 'Foto',
                photos: photos,
                onPhotoAdded: (_) {},
                onPhotoRemoved: (p) => removedPhoto = p,
              ),
            ),
          ),
        ),
      );

      expect(find.text('Foto'), findsOneWidget);
      expect(find.text('1/5 foto'), findsOneWidget);
      expect(find.byIcon(Icons.close), findsOneWidget);

      await tester.tap(find.byIcon(Icons.close));
      expect(removedPhoto, equals('dummy_path.jpg'));
    });
  });
}
