import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../domain/maintenance_model.dart';

final maintenanceRepositoryProvider = Provider<MaintenanceRepository>((ref) {
  final dio = ref.watch(apiClientProvider);
  return MaintenanceRepository(dio);
});

class MaintenanceRepository {
  final Dio _dio;

  MaintenanceRepository(this._dio);

  Future<List<MaintenanceModel>> getRecords({String? statusFilter, int? unitId}) async {
    try {
      final queryParams = <String, dynamic>{
        'limit': 50,
      };
      if (unitId != null) queryParams['unit_id'] = unitId;
      if (statusFilter != null &&
          statusFilter.isNotEmpty &&
          statusFilter != 'Semua Status' &&
          statusFilter != 'SEMUA') {
        queryParams['status'] = statusFilter.toUpperCase();
      }

      final response = await _dio.get('/maintenance', queryParameters: queryParams);
      if (response.statusCode == 200 && response.data?['data'] != null) {
        final list = (response.data['data']['items'] ?? response.data['data']['maintenance']) as List<dynamic>?;
        if (list != null) {
          return list.map((e) => MaintenanceModel.fromJson(e as Map<String, dynamic>)).toList();
        }
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Future<MaintenanceModel?> getRecordById(int id) async {
    try {
      final response = await _dio.get('/maintenance/$id');
      if (response.statusCode == 200 && response.data?['data'] != null) {
        return MaintenanceModel.fromJson(response.data['data'] as Map<String, dynamic>);
      }
    } catch (_) {}
    return null;
  }

  Future<int?> createRecord(MaintenanceModel record) async {
    try {
      final response = await _dio.post('/maintenance', data: record.toApiJson());
      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data?['data']?['id'] as int?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<bool> updateStatus(int id, String newStatus, [String? notes]) async {
    try {
      final response = await _dio.patch(
        '/maintenance/$id/status',
        data: {
          'status': newStatus.toUpperCase(),
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        },
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
