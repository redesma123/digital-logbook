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

  // Initial mock history exactly matching Screen 6 in design image
  final List<LogbookModel> _mockEntries = [
    const LogbookModel(
      id: 1,
      date: '12 Apr 2025',
      time: '08:00',
      shift: 'Pagi',
      unitStatus: 'Running',
      operatorName: 'Andi Pratama',
      voltage: 400,
      current: 820,
      frequency: 50.0,
      activePower: 450,
      powerFactor: 0.98,
      flowRate: 2.50,
      waterLevel: 1.80,
      bearingTemp: 52,
      notes: 'Kondisi normal.',
    ),
    const LogbookModel(
      id: 2,
      date: '11 Apr 2025',
      time: '16:00',
      shift: 'Siang',
      unitStatus: 'Running',
      operatorName: 'Budi Santoso',
      voltage: 400,
      current: 810,
      frequency: 50.0,
      activePower: 445,
      powerFactor: 0.98,
      flowRate: 2.48,
      waterLevel: 1.78,
      bearingTemp: 53,
      notes: 'Operasi berjalan lancar.',
    ),
    const LogbookModel(
      id: 3,
      date: '11 Apr 2025',
      time: '08:00',
      shift: 'Pagi',
      unitStatus: 'Running',
      operatorName: 'Andi Pratama',
      voltage: 398,
      current: 805,
      frequency: 49.9,
      activePower: 438,
      powerFactor: 0.97,
      flowRate: 2.45,
      waterLevel: 1.75,
      bearingTemp: 51,
      notes: 'Normal.',
    ),
    const LogbookModel(
      id: 4,
      date: '10 Apr 2025',
      time: '16:00',
      shift: 'Siang',
      unitStatus: 'Running',
      operatorName: 'Budi Santoso',
      voltage: 400,
      current: 808,
      frequency: 50.0,
      activePower: 440,
      powerFactor: 0.98,
      flowRate: 2.46,
      waterLevel: 1.76,
      bearingTemp: 52,
      notes: 'Kondisi normal.',
    ),
    const LogbookModel(
      id: 5,
      date: '10 Apr 2025',
      time: '08:00',
      shift: 'Pagi',
      unitStatus: 'Running',
      operatorName: 'Andi Pratama',
      voltage: 399,
      current: 800,
      frequency: 50.1,
      activePower: 435,
      powerFactor: 0.98,
      flowRate: 2.40,
      waterLevel: 1.72,
      bearingTemp: 50,
      notes: 'Normal.',
    ),
    const LogbookModel(
      id: 6,
      date: '09 Apr 2025',
      time: '16:00',
      shift: 'Siang',
      unitStatus: 'Running',
      operatorName: 'Budi Santoso',
      voltage: 398,
      current: 795,
      frequency: 50.0,
      activePower: 430,
      powerFactor: 0.97,
      flowRate: 2.38,
      waterLevel: 1.70,
      bearingTemp: 51,
      notes: 'Debit sedikit menurun.',
    ),
    const LogbookModel(
      id: 7,
      date: '09 Apr 2025',
      time: '08:00',
      shift: 'Pagi',
      unitStatus: 'Running',
      operatorName: 'Andi Pratama',
      voltage: 397,
      current: 790,
      frequency: 49.9,
      activePower: 428,
      powerFactor: 0.97,
      flowRate: 2.36,
      waterLevel: 1.68,
      bearingTemp: 50,
      notes: 'Normal.',
    ),
    const LogbookModel(
      id: 8,
      date: '08 Apr 2025',
      time: '16:00',
      shift: 'Siang',
      unitStatus: 'Standby',
      operatorName: 'Budi Santoso',
      voltage: 399,
      current: 798,
      frequency: 50.0,
      activePower: 432,
      powerFactor: 0.97,
      flowRate: 2.38,
      waterLevel: 1.70,
      bearingTemp: 48,
      notes: 'Pembersihan trash rack.',
    ),
    const LogbookModel(
      id: 9,
      date: '08 Apr 2025',
      time: '08:00',
      shift: 'Pagi',
      unitStatus: 'Running',
      operatorName: 'Andi Pratama',
      voltage: 396,
      current: 780,
      frequency: 49.8,
      activePower: 420,
      powerFactor: 0.96,
      flowRate: 2.30,
      waterLevel: 1.65,
      bearingTemp: 49,
      notes: 'Normal.',
    ),
    const LogbookModel(
      id: 10,
      date: '07 Apr 2025',
      time: '16:00',
      shift: 'Siang',
      unitStatus: 'Shutdown',
      operatorName: 'Budi Santoso',
      voltage: 0,
      current: 0,
      frequency: 0,
      activePower: 0,
      powerFactor: 0,
      flowRate: 0.5,
      waterLevel: 1.50,
      bearingTemp: 32,
      notes: 'Shutdown untuk inspeksi rutin saluran.',
    ),
    const LogbookModel(
      id: 11,
      date: '07 Apr 2025',
      time: '08:00',
      shift: 'Pagi',
      unitStatus: 'Running',
      operatorName: 'Andi Pratama',
      voltage: 395,
      current: 770,
      frequency: 49.9,
      activePower: 415,
      powerFactor: 0.96,
      flowRate: 2.25,
      waterLevel: 1.60,
      bearingTemp: 48,
      notes: 'Normal.',
    ),
  ];

  LogbookRepository(this._dio);

  List<LogbookModel> get initialEntries => List.unmodifiable(_mockEntries);

  Future<List<LogbookModel>> getHistory() async {
    try {
      final response = await _dio.get('/logbook');
      if (response.statusCode == 200 && response.data?['data'] != null) {
        final list = response.data['data']['entries'] as List<dynamic>?;
        if (list != null && list.isNotEmpty) {
          return list.map((e) => LogbookModel.fromJson(e as Map<String, dynamic>)).toList();
        }
      }
    } catch (_) {
      // Gracefully fall back to local mock entries
    }
    return List.unmodifiable(_mockEntries);
  }

  Future<LogbookModel?> getById(int id) async {
    try {
      final response = await _dio.get('/logbook/$id');
      if (response.statusCode == 200 && response.data?['data'] != null) {
        return LogbookModel.fromJson(response.data['data'] as Map<String, dynamic>);
      }
    } catch (_) {}

    return _mockEntries.firstWhere((e) => e.id == id, orElse: () => _mockEntries.first);
  }

  Future<bool> createLogbook(LogbookModel entry) async {
    try {
      await _dio.post('/logbook', data: entry.toJson());
    } catch (_) {
      // Save to mock entries
    }
    _mockEntries.insert(0, entry);
    return true;
  }
}
