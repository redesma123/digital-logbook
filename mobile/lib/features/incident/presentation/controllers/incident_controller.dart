import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/incident_model.dart';
import '../../data/incident_repository.dart';

class IncidentState {
  final bool isLoading;
  final List<IncidentModel> incidents;
  final String statusFilter; // 'Semua Status', 'OPEN', 'PROCESS', 'CLOSED'
  final String? errorMessage;

  const IncidentState({
    this.isLoading = false,
    this.incidents = const [],
    this.statusFilter = 'Semua Status',
    this.errorMessage,
  });

  IncidentState copyWith({
    bool? isLoading,
    List<IncidentModel>? incidents,
    String? statusFilter,
    String? errorMessage,
  }) {
    return IncidentState(
      isLoading: isLoading ?? this.isLoading,
      incidents: incidents ?? this.incidents,
      statusFilter: statusFilter ?? this.statusFilter,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final incidentControllerProvider = NotifierProvider<IncidentController, IncidentState>(IncidentController.new);

class IncidentController extends Notifier<IncidentState> {
  late final IncidentRepository _repository;

  @override
  IncidentState build() {
    _repository = ref.watch(incidentRepositoryProvider);
    // Initial synchronous mock data to avoid widget test pump delays
    return IncidentState(
      incidents: IncidentModel.mockIncidents,
      statusFilter: 'Semua Status',
    );
  }

  Future<void> filterByStatus(String status) async {
    state = state.copyWith(isLoading: true, statusFilter: status);
    final items = await _repository.getIncidents(statusFilter: status);
    state = state.copyWith(
      isLoading: false,
      incidents: items,
    );
  }

  Future<bool> createIncident(IncidentModel incident) async {
    state = state.copyWith(isLoading: true);
    await _repository.createIncident(incident);
    final items = await _repository.getIncidents(statusFilter: state.statusFilter);
    state = state.copyWith(
      isLoading: false,
      incidents: items,
    );
    return true;
  }

  Future<void> updateIncidentStatus(int id, String newStatus) async {
    await _repository.updateStatus(id, newStatus);
    final items = await _repository.getIncidents(statusFilter: state.statusFilter);
    state = state.copyWith(incidents: items);
  }
}
