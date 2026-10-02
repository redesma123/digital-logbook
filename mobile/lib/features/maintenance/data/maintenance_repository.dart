import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/maintenance_model.dart';

final maintenanceRepositoryProvider = Provider<MaintenanceRepository>((ref) {
  return MaintenanceRepository();
});

class MaintenanceRepository {
  final List<MaintenanceModel> _records = List.from(MaintenanceModel.mockRecords);

  Future<List<MaintenanceModel>> getRecords({String? statusFilter}) async {
    await Future.delayed(const Duration(milliseconds: 200));
    if (statusFilter == null || statusFilter.isEmpty || statusFilter == 'Semua Status' || statusFilter == 'SEMUA') {
      return List.unmodifiable(_records);
    }
    final normalized = statusFilter.toUpperCase();
    return _records.where((r) => r.status.toUpperCase() == normalized).toList();
  }

  Future<MaintenanceModel?> getRecordById(int id) async {
    await Future.delayed(const Duration(milliseconds: 100));
    try {
      return _records.firstWhere((r) => r.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<MaintenanceModel> createRecord(MaintenanceModel record) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final newId = _records.isEmpty ? 1 : (_records.map((e) => e.id).reduce((a, b) => a > b ? a : b) + 1);
    final created = record.copyWith(id: newId);
    _records.insert(0, created);
    return created;
  }

  Future<MaintenanceModel> updateStatus(int id, String newStatus) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final index = _records.indexWhere((r) => r.id == id);
    if (index != -1) {
      final updated = _records[index].copyWith(status: newStatus);
      _records[index] = updated;
      return updated;
    }
    throw Exception('Maintenance record with id $id not found');
  }
}
