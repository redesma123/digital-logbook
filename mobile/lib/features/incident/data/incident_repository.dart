import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/incident_model.dart';

final incidentRepositoryProvider = Provider<IncidentRepository>((ref) {
  return IncidentRepository();
});

class IncidentRepository {
  final List<IncidentModel> _incidents = List.from(IncidentModel.mockIncidents);

  Future<List<IncidentModel>> getIncidents({String? statusFilter}) async {
    await Future.delayed(const Duration(milliseconds: 200));
    if (statusFilter == null || statusFilter.isEmpty || statusFilter == 'Semua Status' || statusFilter == 'SEMUA') {
      return List.unmodifiable(_incidents);
    }
    final normalized = statusFilter.toUpperCase();
    return _incidents.where((i) => i.status.toUpperCase() == normalized).toList();
  }

  Future<IncidentModel?> getIncidentById(int id) async {
    await Future.delayed(const Duration(milliseconds: 100));
    try {
      return _incidents.firstWhere((i) => i.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<IncidentModel> createIncident(IncidentModel incident) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final newId = _incidents.isEmpty ? 1 : (_incidents.map((e) => e.id).reduce((a, b) => a > b ? a : b) + 1);
    final created = incident.copyWith(id: newId);
    _incidents.insert(0, created);
    return created;
  }

  Future<IncidentModel> updateStatus(int id, String newStatus) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final index = _incidents.indexWhere((i) => i.id == id);
    if (index != -1) {
      final updated = _incidents[index].copyWith(status: newStatus);
      _incidents[index] = updated;
      return updated;
    }
    throw Exception('Incident with id $id not found');
  }
}
