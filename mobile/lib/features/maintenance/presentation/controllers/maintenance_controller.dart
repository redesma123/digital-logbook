import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/attachment_repository.dart';
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
  late final AttachmentRepository _attachmentRepo;

  @override
  MaintenanceState build() {
    _repository = ref.watch(maintenanceRepositoryProvider);
    _attachmentRepo = ref.watch(attachmentRepositoryProvider);
    Future.microtask(() => loadRecords());
    return const MaintenanceState(
      isLoading: true,
      records: [],
      statusFilter: 'Semua Status',
    );
  }

  Future<void> loadRecords() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final items = await _repository.getRecords(statusFilter: state.statusFilter);
      state = state.copyWith(
        isLoading: false,
        records: items,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Gagal memuat data pemeliharaan: $e',
      );
    }
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
    final createdId = await _repository.createRecord(record);
    if (createdId != null) {
      if (record.photos.isNotEmpty) {
        await _attachmentRepo.uploadMultiple(
          filePaths: record.photos,
          relatedTo: 'MAINTENANCE',
          relatedId: createdId,
        );
      }
      final items = await _repository.getRecords(statusFilter: state.statusFilter);
      state = state.copyWith(
        isLoading: false,
        records: items,
      );
      return true;
    }
    state = state.copyWith(isLoading: false);
    return false;
  }

  Future<bool> updateRecordStatus(int id, String newStatus, [String? notes]) async {
    state = state.copyWith(isLoading: true);
    final success = await _repository.updateStatus(id, newStatus, notes);
    final items = await _repository.getRecords(statusFilter: state.statusFilter);
    state = state.copyWith(
      isLoading: false,
      records: items,
    );
    return success;
  }
}
