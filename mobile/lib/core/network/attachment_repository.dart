import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client.dart';

final attachmentRepositoryProvider = Provider<AttachmentRepository>((ref) {
  final dio = ref.watch(apiClientProvider);
  return AttachmentRepository(dio);
});

class AttachmentRepository {
  final Dio _dio;

  AttachmentRepository(this._dio);

  /// Mengunggah satu file gambar ke endpoint backend POST /api/v1/attachments
  Future<bool> uploadAttachment({
    required String filePath,
    required String relatedTo, // 'LOGBOOK', 'INCIDENT', 'MAINTENANCE'
    required int relatedId,
  }) async {
    try {
      final file = File(filePath);
      if (!await file.exists()) return false;

      final filename = filePath.split(Platform.pathSeparator).last.split('/').last;

      final formData = FormData.fromMap({
        'related_to': relatedTo.toUpperCase(),
        'related_id': relatedId,
        'file': await MultipartFile.fromFile(
          filePath,
          filename: filename,
        ),
      });

      final response = await _dio.post(
        '/attachments',
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  /// Mengunggah daftar file gambar secara berurutan
  Future<int> uploadMultiple({
    required List<String> filePaths,
    required String relatedTo,
    required int relatedId,
  }) async {
    int successCount = 0;
    for (final path in filePaths) {
      if (path.isEmpty || path.startsWith('assets/')) continue;
      final ok = await uploadAttachment(
        filePath: path,
        relatedTo: relatedTo,
        relatedId: relatedId,
      );
      if (ok) {
        successCount++;
      }
    }
    return successCount;
  }
}
