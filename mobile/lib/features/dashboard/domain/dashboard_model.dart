class UnitItemModel {
  final int id;
  final String unitCode;
  final String name;
  final String currentStatus;
  final String plantName;

  const UnitItemModel({
    required this.id,
    required this.unitCode,
    required this.name,
    this.currentStatus = 'RUNNING',
    this.plantName = 'PLTMH Sampean Baru',
  });

  factory UnitItemModel.fromJson(Map<String, dynamic> json) {
    String pName = 'PLTMH Sampean Baru';
    if (json['plant'] != null && json['plant'] is Map) {
      pName = json['plant']['name'] as String? ?? pName;
    }
    return UnitItemModel(
      id: json['id'] as int? ?? 1,
      unitCode: json['unit_code'] as String? ?? 'PLTMH-U1',
      name: json['name'] as String? ?? 'Unit 1',
      currentStatus: json['current_status'] as String? ?? 'RUNNING',
      plantName: pName,
    );
  }
}

class DashboardSummaryModel {
  final int unitId;
  final String unitCode;
  final String unitName;
  final String unitStatus;
  final String lastRecordedAt;
  final double activePowerKw;
  final double frequencyHz;
  final double voltageV;
  final double currentA;
  final double todayEnergyKwh;
  final double flowRateM3s;
  final double waterLevelM;
  final double bearingTempC;
  final int activeIncidentsCount;
  final int activeMaintenanceCount;

  const DashboardSummaryModel({
    required this.unitId,
    required this.unitCode,
    required this.unitName,
    required this.unitStatus,
    required this.lastRecordedAt,
    required this.activePowerKw,
    required this.frequencyHz,
    required this.voltageV,
    required this.currentA,
    required this.todayEnergyKwh,
    required this.flowRateM3s,
    required this.waterLevelM,
    required this.bearingTempC,
    this.activeIncidentsCount = 0,
    this.activeMaintenanceCount = 0,
  });

  factory DashboardSummaryModel.fromJson(Map<String, dynamic> json) {
    final unit = json['unit'] as Map<String, dynamic>? ?? {};
    final latest = json['latest_entry'] as Map<String, dynamic>?;

    final electrical = (latest?['electrical'] ?? latest?['params_electrical']) as Map<String, dynamic>?;
    final hydraulic = (latest?['hydraulic'] ?? latest?['params_hydraulic']) as Map<String, dynamic>?;
    final mechanical = (latest?['mechanical'] ?? latest?['params_mechanical']) as Map<String, dynamic>?;

    String dateStr = latest?['date'] as String? ?? '';
    String shiftStr = latest?['shift'] as String? ?? '';
    String recordedText = 'Belum ada data';
    if (dateStr.isNotEmpty) {
      final parts = dateStr.split('T')[0];
      recordedText = '$parts (${shiftStr.isNotEmpty ? shiftStr : "-"})';
    }

    return DashboardSummaryModel(
      unitId: unit['id'] as int? ?? 1,
      unitCode: unit['unit_code'] as String? ?? 'PLTMH-U1',
      unitName: unit['name'] as String? ?? 'Unit 1 (PLTMH)',
      unitStatus: latest?['unit_status'] as String? ?? unit['current_status'] as String? ?? 'RUNNING',
      lastRecordedAt: recordedText,
      activePowerKw: (electrical?['active_power_kw'] as num?)?.toDouble() ?? 0.0,
      frequencyHz: (electrical?['frequency_hz'] as num?)?.toDouble() ?? 0.0,
      voltageV: (electrical?['voltage_v'] as num?)?.toDouble() ?? 0.0,
      currentA: (electrical?['current_a'] as num?)?.toDouble() ?? 0.0,
      todayEnergyKwh: (json['today_energy_kwh'] as num?)?.toDouble() ??
          (electrical?['energy_production_kwh'] as num?)?.toDouble() ??
          0.0,
      flowRateM3s: (hydraulic?['flow_rate_m3s'] as num?)?.toDouble() ?? 0.0,
      waterLevelM: (hydraulic?['water_level_m'] as num?)?.toDouble() ?? 0.0,
      bearingTempC: (mechanical?['bearing_temp_c'] as num?)?.toDouble() ?? 0.0,
      activeIncidentsCount: json['active_incidents_count'] as int? ?? 0,
      activeMaintenanceCount: json['active_maintenance_count'] as int? ?? 0,
    );
  }
}

class DashboardChartPointModel {
  final String label;
  final String date;
  final String shift;
  final double powerKw;
  final double flowM3s;
  final double efficiencyPct;
  final double energyKwh;

  const DashboardChartPointModel({
    required this.label,
    required this.date,
    required this.shift,
    required this.powerKw,
    required this.flowM3s,
    required this.efficiencyPct,
    required this.energyKwh,
  });

  factory DashboardChartPointModel.fromLogbook(Map<String, dynamic> json) {
    final dateStr = (json['date'] as String? ?? '').split('T')[0];
    final shiftStr = json['shift'] as String? ?? '';
    final electrical = (json['params_electrical'] ?? json['electrical']) as Map<String, dynamic>?;
    final hydraulic = (json['params_hydraulic'] ?? json['hydraulic']) as Map<String, dynamic>?;

    final power = (electrical?['active_power_kw'] as num?)?.toDouble() ?? 0.0;
    final flow = (hydraulic?['flow_rate_m3s'] as num?)?.toDouble() ?? 0.0;
    final energy = (electrical?['energy_production_kwh'] as num?)?.toDouble() ?? 0.0;

    // Hitung estimasi efisiensi bila daya dan debit terisi (P / (9.81 * Q * H))
    double efficiency = 0.0;
    if (power > 0 && flow > 0) {
      efficiency = (power / (flow * 9.81 * 25.0)) * 100;
      if (efficiency > 95) efficiency = 92.5;
      if (efficiency < 40) efficiency = 75.0;
    }

    return DashboardChartPointModel(
      label: dateStr.length >= 5 ? dateStr.substring(5) : dateStr,
      date: dateStr,
      shift: shiftStr,
      powerKw: power,
      flowM3s: flow,
      efficiencyPct: double.parse(efficiency.toStringAsFixed(1)),
      energyKwh: energy,
    );
  }
}
