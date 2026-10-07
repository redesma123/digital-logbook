import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/network/attachment_repository.dart';
import '../../domain/logbook_model.dart';
import '../../data/logbook_repository.dart';

class LogbookState {
  final bool isLoading;
  final List<LogbookModel> entries;
  final LogbookModel? selectedEntry;
  final String dateFilter;
  final DateTime? fromDate;
  final DateTime? toDate;
  final int? selectedUnitId;
  final String? selectedShift;
  final String? errorMessage;

  const LogbookState({
    this.isLoading = false,
    this.entries = const [],
    this.selectedEntry,
    this.dateFilter = 'Semua Tanggal',
    this.fromDate,
    this.toDate,
    this.selectedUnitId,
    this.selectedShift,
    this.errorMessage,
  });

  LogbookState copyWith({
    bool? isLoading,
    List<LogbookModel>? entries,
    LogbookModel? selectedEntry,
    bool clearSelectedEntry = false,
    String? dateFilter,
    DateTime? fromDate,
    DateTime? toDate,
    bool clearDates = false,
    int? selectedUnitId,
    bool clearUnitId = false,
    String? selectedShift,
    bool clearShift = false,
    String? errorMessage,
  }) {
    return LogbookState(
      isLoading: isLoading ?? this.isLoading,
      entries: entries ?? this.entries,
      selectedEntry: clearSelectedEntry ? null : (selectedEntry ?? this.selectedEntry),
      dateFilter: dateFilter ?? this.dateFilter,
      fromDate: clearDates ? null : (fromDate ?? this.fromDate),
      toDate: clearDates ? null : (toDate ?? this.toDate),
      selectedUnitId: clearUnitId ? null : (selectedUnitId ?? this.selectedUnitId),
      selectedShift: clearShift ? null : (selectedShift ?? this.selectedShift),
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final logbookControllerProvider = NotifierProvider<LogbookController, LogbookState>(LogbookController.new);

class LogbookController extends Notifier<LogbookState> {
  late final LogbookRepository _repository;
  late final AttachmentRepository _attachmentRepo;

  @override
  LogbookState build() {
    _repository = ref.watch(logbookRepositoryProvider);
    _attachmentRepo = ref.watch(attachmentRepositoryProvider);
    Future.microtask(() => loadHistory());
    return const LogbookState(
      isLoading: true,
      entries: [],
      dateFilter: 'Semua Tanggal',
    );
  }

  Future<void> loadHistory({
    int? unitId,
    DateTime? fromDate,
    DateTime? toDate,
    String? shift,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    final uId = unitId ?? state.selectedUnitId;
    final fDate = fromDate ?? state.fromDate;
    final tDate = toDate ?? state.toDate;
    final sShift = shift ?? state.selectedShift;

    final fromStr = fDate != null ? DateFormat('yyyy-MM-dd').format(fDate) : null;
    final toStr = tDate != null ? DateFormat('yyyy-MM-dd').format(tDate) : null;

    String dateLabel = 'Semua Tanggal';
    if (fDate != null && tDate != null) {
      final fStr = DateFormat('dd MMM yyyy').format(fDate);
      final tStr = DateFormat('dd MMM yyyy').format(tDate);
      dateLabel = (fStr == tStr) ? fStr : '$fStr - $tStr';
    } else if (fDate != null) {
      dateLabel = 'Sejak ${DateFormat('dd MMM yyyy').format(fDate)}';
    } else if (tDate != null) {
      dateLabel = 'Hingga ${DateFormat('dd MMM yyyy').format(tDate)}';
    }

    try {
      final items = await _repository.getHistory(
        unitId: uId,
        from: fromStr,
        to: toStr,
        shift: sShift,
      );

      state = state.copyWith(
        isLoading: false,
        entries: items,
        selectedEntry: items.isNotEmpty ? items.first : null,
        dateFilter: dateLabel,
        fromDate: fDate,
        toDate: tDate,
        selectedUnitId: uId,
        selectedShift: sShift,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Gagal memuat histori logbook: $e',
      );
    }
  }

  Future<void> setDateRange(DateTime? start, DateTime? end) async {
    if (start == null || end == null) {
      state = state.copyWith(clearDates: true, dateFilter: 'Semua Tanggal');
      await loadHistory(fromDate: null, toDate: null);
    } else {
      await loadHistory(fromDate: start, toDate: end);
    }
  }

  Future<void> setUnitFilter(int? unitId) async {
    if (unitId == null) {
      state = state.copyWith(clearUnitId: true);
      await loadHistory(unitId: null);
    } else {
      await loadHistory(unitId: unitId);
    }
  }

  Future<void> setShiftFilter(String? shift) async {
    if (shift == null || shift == 'SEMUA') {
      state = state.copyWith(clearShift: true);
      await loadHistory(shift: null);
    } else {
      await loadHistory(shift: shift);
    }
  }

  Future<void> selectEntry(LogbookModel entry) async {
    state = state.copyWith(selectedEntry: entry);
  }

  Future<void> refreshDetail(int id) async {
    final entry = await _repository.getById(id);
    if (entry != null) {
      state = state.copyWith(selectedEntry: entry);
    }
  }

  Future<bool> saveLogbook(LogbookModel entry) async {
    state = state.copyWith(isLoading: true);
    final createdId = await _repository.createLogbook(entry);
    if (createdId != null) {
      if (entry.photos.isNotEmpty) {
        await _attachmentRepo.uploadMultiple(
          filePaths: entry.photos,
          relatedTo: 'LOGBOOK',
          relatedId: createdId,
        );
      }
      await loadHistory();
      return true;
    }
    state = state.copyWith(isLoading: false);
    return false;
  }
}
