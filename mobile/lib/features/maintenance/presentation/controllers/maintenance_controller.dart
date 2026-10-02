import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/maintenance_model.dart';
import '../../data/maintenance_repository.dart';

class MaintenanceState {
  final bool isLoading;
  final List<MaintenanceModel> records;
  final String statusFilter; // 'Semua Status', 'PLAN', 'PROCESS', 'COMPLETE'
  final String? errorMessage;

  const MaintenanceState({
    this.isLoading = false,
    this.records = const [],
    this.statusFilter = 'Semua Status',
    this.errorMessage,
  });

  MaintenanceState copyWith({
    bool? isLoading,
    List<MaintenanceModel>? records,
    String? statusFilter,
    String? errorMessage,
  }) {
    return MaintenanceState(
      isLoading: isLoading ?? this.isLoading,
      records: records ?? this.records,
      statusFilter: statusFilter ?? this.statusFilter,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final maintenanceControllerProvider = NotifierProvider<MaintenanceController, MaintenanceState>(MaintenanceController.new);

class MaintenanceController extends Notifier<MaintenanceState> {
  late final MaintenanceRepository _repository;

  @override
  MaintenanceState build() {
    _repository = ref.watch(maintenanceRepositoryProvider);
    return MaintenanceState(
      records: MaintenanceModel.mockRecords,
      statusFilter: 'Semua Status',
    );
  }

  Future<void> filterByStatus(String status) async {
    state = state.copyWith(isLoading: true, statusFilter: status);
    final items = await _repository.getRecords(statusFilter: status);
    state = state.copyWith(
      isLoading: false,
      records: items,
    );
  }

  Future<bool> createRecord(MaintenanceModel record) async {
    state = state.copyWith(isLoading: true);
    await _repository.createRecord(record);
    final items = await _repository.getRecords(statusFilter: state.statusFilter);
    state = state.copyWith(
      isLoading: false,
      records: items,
    );
    return true;
  }

  Future<void> updateRecordStatus(int id, String newStatus) async {
    await _repository.updateStatus(id, newStatus);
    final items = await _repository.getRecords(statusFilter: state.statusFilter);
    state = state.copyWith(records: items);
  }
}
