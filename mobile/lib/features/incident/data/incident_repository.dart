import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../domain/incident_model.dart';

final incidentRepositoryProvider = Provider<IncidentRepository>((ref) {
  final dio = ref.watch(apiClientProvider);
  return IncidentRepository(dio);
});

class IncidentRepository {
  final Dio _dio;

  IncidentRepository(this._dio);

  Future<List<IncidentModel>> getIncidents({String? statusFilter, int? unitId}) async {
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

      final response = await _dio.get('/incidents', queryParameters: queryParams);
      if (response.statusCode == 200 && response.data?['data'] != null) {
        final list = (response.data['data']['items'] ?? response.data['data']['incidents']) as List<dynamic>?;
        if (list != null) {
          return list.map((e) => IncidentModel.fromJson(e as Map<String, dynamic>)).toList();
        }
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Future<IncidentModel?> getIncidentById(int id) async {
    try {
      final response = await _dio.get('/incidents/$id');
      if (response.statusCode == 200 && response.data?['data'] != null) {
        return IncidentModel.fromJson(response.data['data'] as Map<String, dynamic>);
      }
    } catch (_) {}
    return null;
  }

  Future<int?> createIncident(IncidentModel incident) async {
    try {
      final response = await _dio.post('/incidents', data: incident.toApiJson());
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
        '/incidents/$id/status',
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
