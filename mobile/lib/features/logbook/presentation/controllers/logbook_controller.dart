import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/logbook_model.dart';
import '../../data/logbook_repository.dart';

class LogbookState {
  final bool isLoading;
  final List<LogbookModel> entries;
  final LogbookModel? selectedEntry;
  final String dateFilter;
  final String? errorMessage;

  const LogbookState({
    this.isLoading = false,
    this.entries = const [],
    this.selectedEntry,
    this.dateFilter = '01 Apr 2025 - 30 Apr 2025',
    this.errorMessage,
  });

  LogbookState copyWith({
    bool? isLoading,
    List<LogbookModel>? entries,
    LogbookModel? selectedEntry,
    String? dateFilter,
    String? errorMessage,
  }) {
    return LogbookState(
      isLoading: isLoading ?? this.isLoading,
      entries: entries ?? this.entries,
      selectedEntry: selectedEntry ?? this.selectedEntry,
      dateFilter: dateFilter ?? this.dateFilter,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final logbookControllerProvider = NotifierProvider<LogbookController, LogbookState>(LogbookController.new);

class LogbookController extends Notifier<LogbookState> {
  late final LogbookRepository _repository;

  @override
  LogbookState build() {
    _repository = ref.watch(logbookRepositoryProvider);
    final initialList = _repository.initialEntries;
    return LogbookState(
      entries: initialList,
      selectedEntry: initialList.isNotEmpty ? initialList.first : null,
    );
  }

  Future<void> loadHistory() async {
    state = state.copyWith(isLoading: true);
    final items = await _repository.getHistory();
    state = state.copyWith(
      isLoading: false,
      entries: items,
      selectedEntry: items.isNotEmpty ? items.first : null,
    );
  }

  Future<void> selectEntry(LogbookModel entry) async {
    state = state.copyWith(selectedEntry: entry);
  }

  Future<bool> saveLogbook(LogbookModel entry) async {
    state = state.copyWith(isLoading: true);
    final success = await _repository.createLogbook(entry);
    final items = await _repository.getHistory();
    state = state.copyWith(
      isLoading: false,
      entries: items,
      selectedEntry: entry,
    );
    return success;
  }
}
