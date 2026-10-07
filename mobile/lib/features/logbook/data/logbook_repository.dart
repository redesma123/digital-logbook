import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../domain/logbook_model.dart';

final logbookRepositoryProvider = Provider<LogbookRepository>((ref) {
  final dio = ref.watch(apiClientProvider);
  return LogbookRepository(dio);
});

class LogbookRepository {
  final Dio _dio;

  LogbookRepository(this._dio);

  /// Mengambil riwayat logbook dari database backend sesuai filter
  Future<List<LogbookModel>> getHistory({
    int? unitId,
    String? from,
    String? to,
    String? shift,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'limit': 50,
      };
      if (unitId != null) queryParams['unit_id'] = unitId;
      if (from != null && from.isNotEmpty) queryParams['from'] = from;
      if (to != null && to.isNotEmpty) queryParams['to'] = to;
      if (shift != null && shift.isNotEmpty && shift != 'SEMUA') {
        queryParams['shift'] = shift.toUpperCase();
      }

      final response = await _dio.get('/logbook', queryParameters: queryParams);
      if (response.statusCode == 200 && response.data?['data'] != null) {
        final list = (response.data['data']['items'] ?? response.data['data']['entries']) as List<dynamic>?;
        if (list != null) {
          return list.map((e) => LogbookModel.fromJson(e as Map<String, dynamic>)).toList();
        }
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  /// Mengambil detail logbook berdasarkan ID dari database backend
  Future<LogbookModel?> getById(int id) async {
    try {
      final response = await _dio.get('/logbook/$id');
      if (response.statusCode == 200 && response.data?['data'] != null) {
        return LogbookModel.fromJson(response.data['data'] as Map<String, dynamic>);
      }
    } catch (_) {}
    return null;
  }

  /// Mengambil stand HM akhir shift terakhir untuk unit terkait dari endpoint riil
  Future<double?> fetchLatestHourMeter(int unitId) async {
    try {
      final res = await _dio.get(
        '/logbook/latest-counter',
        queryParameters: {'unit_id': unitId},
      );
      if (res.statusCode == 200 && res.data?['data'] != null) {
        final val = res.data['data']['hour_meter_end'] as num?;
        if (val != null) return val.toDouble();
      }
    } catch (_) {}
    return null;
  }

  /// Mengirim entri logbook baru ke backend database dan mengembalikan ID entri yang dibuat
  Future<int?> createLogbook(LogbookModel entry) async {
    try {
      final res = await _dio.post('/logbook', data: entry.toApiJson());
      if (res.statusCode == 200 || res.statusCode == 201) {
        return res.data?['data']?['id'] as int?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
