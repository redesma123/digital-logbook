import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/dashboard_repository.dart';
import '../../domain/dashboard_model.dart';

class DashboardState {
  final bool isLoading;
  final bool isRefreshing;
  final String? errorMessage;
  final DashboardSummaryModel? summary;
  final List<DashboardChartPointModel> chartPoints;
  final List<UnitItemModel> units;
  final int selectedUnitId;

  const DashboardState({
    this.isLoading = false,
    this.isRefreshing = false,
    this.errorMessage,
    this.summary,
    this.chartPoints = const [],
    this.units = const [],
    this.selectedUnitId = 1,
  });

  DashboardState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    String? errorMessage,
    DashboardSummaryModel? summary,
    List<DashboardChartPointModel>? chartPoints,
    List<UnitItemModel>? units,
    int? selectedUnitId,
    bool clearError = false,
  }) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      summary: summary ?? this.summary,
      chartPoints: chartPoints ?? this.chartPoints,
      units: units ?? this.units,
      selectedUnitId: selectedUnitId ?? this.selectedUnitId,
    );
  }
}

final dashboardControllerProvider =
    NotifierProvider<DashboardController, DashboardState>(DashboardController.new);

class DashboardController extends Notifier<DashboardState> {
  late final DashboardRepository _repository;

  @override
  DashboardState build() {
    _repository = ref.watch(dashboardRepositoryProvider);
    Future.microtask(() => initDashboard());
    return const DashboardState(isLoading: true);
  }

  Future<void> initDashboard() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final units = await _repository.getUnits();
      final activeUnitId = units.isNotEmpty ? units.first.id : 1;

      final summary = await _repository.getSummary(activeUnitId);
      final chartPoints = await _repository.getChartPoints(activeUnitId);

      state = state.copyWith(
        isLoading: false,
        units: units,
        selectedUnitId: activeUnitId,
        summary: summary,
        chartPoints: chartPoints,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Gagal memuat data dashboard: ${e.toString()}',
      );
    }
  }

  Future<void> selectUnit(int unitId) async {
    if (state.selectedUnitId == unitId && state.summary != null) return;

    state = state.copyWith(isLoading: true, selectedUnitId: unitId, clearError: true);
    try {
      final summary = await _repository.getSummary(unitId);
      final chartPoints = await _repository.getChartPoints(unitId);

      state = state.copyWith(
        isLoading: false,
        selectedUnitId: unitId,
        summary: summary,
        chartPoints: chartPoints,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Gagal memuat unit: ${e.toString()}',
      );
    }
  }

  Future<void> refresh() async {
    state = state.copyWith(isRefreshing: true, clearError: true);
    try {
      final summary = await _repository.getSummary(state.selectedUnitId);
      final chartPoints = await _repository.getChartPoints(state.selectedUnitId);

      state = state.copyWith(
        isRefreshing: false,
        summary: summary,
        chartPoints: chartPoints,
      );
    } catch (e) {
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: 'Gagal memperbarui data: ${e.toString()}',
      );
    }
  }
}
