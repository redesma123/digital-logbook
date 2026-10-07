import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../domain/dashboard_model.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  final dio = ref.watch(apiClientProvider);
  return DashboardRepository(dio);
});

class DashboardRepository {
  final Dio _dio;

  DashboardRepository(this._dio);

  /// Mengambil daftar seluruh unit pembangkit dari database (tabel units)
  Future<List<UnitItemModel>> getUnits() async {
    try {
      final response = await _dio.get('/units');
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] as List<dynamic>?;
        if (list != null && list.isNotEmpty) {
          return list.map((item) => UnitItemModel.fromJson(item as Map<String, dynamic>)).toList();
        }
      }
    } catch (_) {}

    // Fallback default unit PLTMH Sampean Baru jika offline
    return const [
      UnitItemModel(
        id: 1,
        unitCode: 'PLTMH-U1',
        name: 'Unit 1 (PLTMH)',
        currentStatus: 'RUNNING',
      ),
      UnitItemModel(
        id: 2,
        unitCode: 'PLTMH-U2',
        name: 'Unit 2 (PLTMH)',
        currentStatus: 'STANDBY',
      ),
    ];
  }

  /// Mengambil data ringkasan dashboard untuk unit tertentu
  Future<DashboardSummaryModel> getSummary(int unitId) async {
    // 1. Coba endpoint resmi /dashboard/summary (SUPERVISOR / MANAGEMENT / ADMIN)
    try {
      final response = await _dio.get(
        '/dashboard/summary',
        queryParameters: {'unit_id': unitId},
      );
      if (response.statusCode == 200 && response.data?['data'] != null) {
        return DashboardSummaryModel.fromJson(response.data['data'] as Map<String, dynamic>);
      }
    } on DioException catch (e) {
      // Jika 403 Forbidden (Role OPERATOR), fallback membaca dari /logbook & /units
      if (e.response?.statusCode != 403) {
        // Jika error jaringan atau lainnya, biarkan lanjut ke fallback
      }
    } catch (_) {}

    // 2. Fallback query langsung dari /logbook dan /units untuk OPERATOR
    try {
      final unitRes = await _dio.get('/units/$unitId');
      final unitData = (unitRes.statusCode == 200) ? (unitRes.data?['data'] as Map<String, dynamic>?) : null;

      final logRes = await _dio.get(
        '/logbook',
        queryParameters: {'unit_id': unitId, 'page': 1, 'limit': 1},
      );

      Map<String, dynamic>? latestEntry;
      if (logRes.statusCode == 200 && logRes.data?['data'] != null) {
        final entries = (logRes.data['data']['items'] ?? logRes.data['data']['entries']) as List<dynamic>?;
        if (entries != null && entries.isNotEmpty) {
          latestEntry = entries.first as Map<String, dynamic>;
        }
      }

      if (unitData != null || latestEntry != null) {
        return DashboardSummaryModel.fromJson({
          'unit': unitData ?? {
            'id': unitId,
            'unit_code': 'PLTMH-U1',
            'name': 'Unit 1 (PLTMH)',
            'current_status': latestEntry?['unit_status'] ?? 'RUNNING',
          },
          'latest_entry': latestEntry,
          'today_energy_kwh': (latestEntry?['params_electrical']?['energy_production_kwh'] as num?)?.toDouble() ?? 0.0,
          'active_incidents_count': 0,
          'active_maintenance_count': 0,
        });
      }
    } catch (_) {}

    // 3. Fallback data standar jika jaringan offline
    return DashboardSummaryModel(
      unitId: unitId,
      unitCode: 'PLTMH-U1',
      unitName: 'Unit 1 (PLTMH)',
      unitStatus: 'RUNNING',
      lastRecordedAt: 'Standby Telemetri',
      activePowerKw: 0.0,
      frequencyHz: 0.0,
      voltageV: 0.0,
      currentA: 0.0,
      todayEnergyKwh: 0.0,
      flowRateM3s: 0.0,
      waterLevelM: 0.0,
      bearingTempC: 0.0,
    );
  }

  /// Mengambil data tren parameter untuk grafik (7 entri terakhir)
  Future<List<DashboardChartPointModel>> getChartPoints(int unitId) async {
    try {
      final logRes = await _dio.get(
        '/logbook',
        queryParameters: {'unit_id': unitId, 'page': 1, 'limit': 7},
      );

      if (logRes.statusCode == 200 && logRes.data?['data'] != null) {
        final entries = (logRes.data['data']['items'] ?? logRes.data['data']['entries']) as List<dynamic>?;
        if (entries != null && entries.isNotEmpty) {
          // Balikkan urutan agar tanggal terlama di sebelah kiri, terbaru di sebelah kanan
          final points = entries
              .reversed
              .map((e) => DashboardChartPointModel.fromLogbook(e as Map<String, dynamic>))
              .toList();
          return points;
        }
      }
    } catch (_) {}

    return const [];
  }
}
