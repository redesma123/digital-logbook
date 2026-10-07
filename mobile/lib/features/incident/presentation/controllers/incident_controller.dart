import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/attachment_repository.dart';
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
  late final AttachmentRepository _attachmentRepo;

  @override
  IncidentState build() {
    _repository = ref.watch(incidentRepositoryProvider);
    _attachmentRepo = ref.watch(attachmentRepositoryProvider);
    Future.microtask(() => loadIncidents());
    return const IncidentState(
      isLoading: true,
      incidents: [],
      statusFilter: 'Semua Status',
    );
  }

  Future<void> loadIncidents() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final items = await _repository.getIncidents(statusFilter: state.statusFilter);
      state = state.copyWith(
        isLoading: false,
        incidents: items,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Gagal memuat data gangguan: $e',
      );
    }
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
    final createdId = await _repository.createIncident(incident);
    if (createdId != null) {
      if (incident.photos.isNotEmpty) {
        await _attachmentRepo.uploadMultiple(
          filePaths: incident.photos,
          relatedTo: 'INCIDENT',
          relatedId: createdId,
        );
      }
      final items = await _repository.getIncidents(statusFilter: state.statusFilter);
      state = state.copyWith(
        isLoading: false,
        incidents: items,
      );
      return true;
    }
    state = state.copyWith(isLoading: false);
    return false;
  }

  Future<bool> updateIncidentStatus(int id, String newStatus, [String? notes]) async {
    state = state.copyWith(isLoading: true);
    final success = await _repository.updateStatus(id, newStatus, notes);
    final items = await _repository.getIncidents(statusFilter: state.statusFilter);
    state = state.copyWith(
      isLoading: false,
      incidents: items,
    );
    return success;
  }
}
