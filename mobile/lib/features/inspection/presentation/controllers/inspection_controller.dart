import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/presentation/controllers/auth_controller.dart';
import 'package:mobile/features/inspection/data/inspection_repository.dart';
import 'package:mobile/features/inspection/domain/inspection_model.dart';

class InspectionState {
  final bool isLoading;
  final bool isSaving;
  final List<InspectionRecordModel> records;
  final List<InspectionItemModel> currentItems;
  final List<String> currentPhotos;
  final String currentUnit;
  final String? errorMessage;
  final String? successMessage;

  const InspectionState({
    this.isLoading = false,
    this.isSaving = false,
    this.records = const [],
    this.currentItems = const [],
    this.currentPhotos = const [],
    this.currentUnit = 'Unit 1 & Saluran Air',
    this.errorMessage,
    this.successMessage,
  });

  InspectionState copyWith({
    bool? isLoading,
    bool? isSaving,
    List<InspectionRecordModel>? records,
    List<InspectionItemModel>? currentItems,
    List<String>? currentPhotos,
    String? currentUnit,
    String? errorMessage,
    String? successMessage,
    bool clearMessages = false,
  }) {
    return InspectionState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      records: records ?? this.records,
      currentItems: currentItems ?? this.currentItems,
      currentPhotos: currentPhotos ?? this.currentPhotos,
      currentUnit: currentUnit ?? this.currentUnit,
      errorMessage: clearMessages ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearMessages ? null : (successMessage ?? this.successMessage),
    );
  }
}

final inspectionControllerProvider =
    NotifierProvider<InspectionController, InspectionState>(InspectionController.new);

class InspectionController extends Notifier<InspectionState> {
  late final InspectionRepository _repository;

  @override
  InspectionState build() {
    _repository = ref.watch(inspectionRepositoryProvider);
    Future.microtask(() => loadHistory());
    return InspectionState(
      currentItems: _repository.getDefaultTemplateItems(),
    );
  }

  Future<void> loadHistory() async {
    state = state.copyWith(isLoading: true, clearMessages: true);
    try {
      final list = await _repository.getAllRecords();
      state = state.copyWith(
        isLoading: false,
        records: list,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Gagal memuat riwayat inspeksi: $e',
      );
    }
  }

  void updateItemStatus(String id, String newStatus) {
    final updated = state.currentItems.map((item) {
      if (item.id == id) {
        return item.copyWith(status: newStatus);
      }
      return item;
    }).toList();
    state = state.copyWith(currentItems: updated);
  }

  void addPhoto(String path) {
    if (state.currentPhotos.contains(path)) return;
    state = state.copyWith(currentPhotos: [...state.currentPhotos, path]);
  }

  void removePhoto(String path) {
    state = state.copyWith(
      currentPhotos: state.currentPhotos.where((p) => p != path).toList(),
    );
  }

  void setUnit(String unit) {
    state = state.copyWith(currentUnit: unit);
  }

  Future<bool> saveCurrentInspection({required String notes}) async {
    state = state.copyWith(isSaving: true, clearMessages: true);
    try {
      final authState = ref.read(authControllerProvider);
      final inspectorName = authState.user?.fullName ?? authState.user?.username ?? 'Operator Lapangan';

      final record = InspectionRecordModel(
        id: 'insp-${DateTime.now().millisecondsSinceEpoch}',
        createdAt: DateTime.now(),
        inspectorName: inspectorName,
        unitName: state.currentUnit,
        items: List.from(state.currentItems),
        notes: notes.trim(),
        photos: List.from(state.currentPhotos),
      );

      final ok = await _repository.saveRecord(record);
      if (ok) {
        final updatedList = await _repository.getAllRecords();
        state = state.copyWith(
          isSaving: false,
          records: updatedList,
          currentItems: _repository.getDefaultTemplateItems(),
          currentPhotos: const [],
          successMessage: 'Hasil checklist inspeksi berhasil disimpan ke riwayat!',
        );
        return true;
      } else {
        state = state.copyWith(
          isSaving: false,
          errorMessage: 'Gagal menyimpan checklist inspeksi.',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Terjadi kesalahan: $e',
      );
      return false;
    }
  }
}
