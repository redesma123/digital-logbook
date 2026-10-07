class LogbookModel {
  final int id;
  final int unitId;
  final String unitName;
  final String date; // YYYY-MM-DD
  final String time;
  final String shift; // PAGI, SIANG, MALAM
  final String unitStatus; // RUNNING, STANDBY, OFFLINE, TRIP
  final String operatorName;
  final double voltage; // V
  final double current; // A
  final double frequency; // Hz
  final double activePower; // kW
  final double powerFactor;
  final double flowRate; // m3/s
  final double waterLevel; // m
  final double bearingTemp; // °C
  final double? hourMeterStart; // jam, stand HM awal shift
  final double? hourMeterEnd; // jam, stand HM akhir shift
  final double? energyProductionKwh; // kWh
  final String notes;
  final List<String> photos;

  // Parameter tambahan opsional (sesuai tabel database)
  final double? reactivePowerKvar;
  final double? rpm;
  final double? generatorTemp;
  final double? turbineTemp;
  final double? vibrationMms;
  final double? headM;
  final double? pressureBar;
  final String? intakeCondition;
  final String? generatorStatus;

  const LogbookModel({
    required this.id,
    this.unitId = 1,
    this.unitName = 'Unit 1',
    required this.date,
    this.time = '08:00',
    required this.shift,
    required this.unitStatus,
    this.operatorName = 'Operator',
    required this.voltage,
    required this.current,
    required this.frequency,
    required this.activePower,
    required this.powerFactor,
    required this.flowRate,
    required this.waterLevel,
    required this.bearingTemp,
    this.hourMeterStart,
    this.hourMeterEnd,
    this.energyProductionKwh,
    this.notes = '',
    this.photos = const [],
    this.reactivePowerKvar,
    this.rpm,
    this.generatorTemp,
    this.turbineTemp,
    this.vibrationMms,
    this.headM,
    this.pressureBar,
    this.intakeCondition,
    this.generatorStatus,
  });

  /// running_hours = hour_meter_end - hour_meter_start. Null bila salah satu kosong.
  double? get runningHours =>
      (hourMeterStart != null && hourMeterEnd != null && hourMeterEnd! >= hourMeterStart!)
          ? double.parse((hourMeterEnd! - hourMeterStart!).toStringAsFixed(2))
          : null;

  factory LogbookModel.fromJson(Map<String, dynamic> json) {
    final electrical = (json['params_electrical'] ?? json['electrical']) as Map<String, dynamic>?;
    final hydraulic = (json['params_hydraulic'] ?? json['hydraulic']) as Map<String, dynamic>?;
    final mechanical = (json['params_mechanical'] ?? json['mechanical']) as Map<String, dynamic>?;
    final operatorObj = json['operator'] as Map<String, dynamic>?;
    final unitObj = json['unit'] as Map<String, dynamic>?;

    final rawDate = json['date'] as String? ?? '';
    final formattedDate = rawDate.contains('T') ? rawDate.split('T')[0] : rawDate;

    // Parse waktu dari format ISO created_at atau shift jika field time tidak disediakan
    String parsedTime = json['time'] as String? ?? '';
    if (parsedTime.isEmpty) {
      final createdAt = json['created_at'] as String?;
      if (createdAt != null && createdAt.contains('T')) {
        try {
          final dt = DateTime.parse(createdAt).toLocal();
          parsedTime = '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
        } catch (_) {}
      }
      if (parsedTime.isEmpty) {
        final shiftStr = (json['shift'] as String? ?? 'PAGI').toUpperCase();
        if (shiftStr == 'PAGI') {
          parsedTime = '07:00';
        } else if (shiftStr == 'SIANG') {
          parsedTime = '15:00';
        } else {
          parsedTime = '23:00';
        }
      }
    }

    // Parse lampiran foto dari tabel attachments atau photos
    final attachments = json['attachments'] as List<dynamic>?;
    List<String> parsedPhotos = [];
    if (attachments != null && attachments.isNotEmpty) {
      parsedPhotos = attachments
          .map((a) {
            if (a is Map) {
              if (a['id'] != null) {
                return '/attachments/${a['id']}/file';
              }
              return (a['file_path'] ?? a['url'] ?? '').toString();
            }
            return a.toString();
          })
          .where((p) => p.isNotEmpty)
          .toList();
    } else if (json['photos'] is List) {
      parsedPhotos = (json['photos'] as List<dynamic>)
          .map((e) => e.toString())
          .where((p) => p.isNotEmpty)
          .toList();
    }

    final double? parsedEnergy = (electrical?['energy_production_kwh'] as num?)?.toDouble() ??
        (json['energy_production_kwh'] as num?)?.toDouble();

    return LogbookModel(
      id: json['id'] as int? ?? 0,
      unitId: json['unit_id'] as int? ?? (unitObj?['id'] as int? ?? 1),
      unitName: unitObj?['name'] as String? ??
          (unitObj?['unit_code'] as String?) ??
          (json['unit_name'] as String? ?? 'Unit 1'),
      date: formattedDate.isNotEmpty ? formattedDate : DateTime.now().toIso8601String().split('T')[0],
      time: parsedTime,
      shift: (json['shift'] as String? ?? 'PAGI').toUpperCase(),
      unitStatus: (json['unit_status'] as String? ?? 'RUNNING').toUpperCase(),
      operatorName: operatorObj?['full_name'] as String? ??
          operatorObj?['username'] as String? ??
          (json['operator_name'] as String? ?? 'Operator'),
      voltage: (electrical?['voltage_v'] as num?)?.toDouble() ??
          (json['voltage'] as num?)?.toDouble() ?? 0.0,
      current: (electrical?['current_a'] as num?)?.toDouble() ??
          (json['current'] as num?)?.toDouble() ?? 0.0,
      frequency: (electrical?['frequency_hz'] as num?)?.toDouble() ??
          (json['frequency'] as num?)?.toDouble() ?? 0.0,
      activePower: (electrical?['active_power_kw'] as num?)?.toDouble() ??
          (json['active_power'] as num?)?.toDouble() ?? 0.0,
      powerFactor: (electrical?['power_factor'] as num?)?.toDouble() ??
          (json['power_factor'] as num?)?.toDouble() ?? 0.0,
      flowRate: (hydraulic?['flow_rate_m3s'] as num?)?.toDouble() ??
          (json['flow_rate'] as num?)?.toDouble() ?? 0.0,
      waterLevel: (hydraulic?['water_level_m'] as num?)?.toDouble() ??
          (json['water_level'] as num?)?.toDouble() ?? 0.0,
      bearingTemp: (mechanical?['bearing_temp_c'] as num?)?.toDouble() ??
          (json['bearing_temp'] as num?)?.toDouble() ?? 0.0,
      hourMeterStart: (json['hour_meter_start'] as num?)?.toDouble(),
      hourMeterEnd: (json['hour_meter_end'] as num?)?.toDouble(),
      energyProductionKwh: parsedEnergy,
      notes: json['notes'] as String? ?? '',
      photos: parsedPhotos,
      reactivePowerKvar: (electrical?['reactive_power_kvar'] as num?)?.toDouble(),
      generatorStatus: electrical?['generator_status'] as String?,
      rpm: (mechanical?['rpm'] as num?)?.toDouble(),
      generatorTemp: (mechanical?['generator_temp_c'] as num?)?.toDouble(),
      turbineTemp: (mechanical?['turbine_temp_c'] as num?)?.toDouble(),
      vibrationMms: (mechanical?['vibration_mms'] as num?)?.toDouble(),
      headM: (hydraulic?['head_m'] as num?)?.toDouble(),
      pressureBar: (hydraulic?['pressure_bar'] as num?)?.toDouble(),
      intakeCondition: hydraulic?['intake_condition'] as String?,
    );
  }

  /// Format hierarkis sesuai createLogbookSchema di backend (REST API)
  Map<String, dynamic> toApiJson() {
    final double? runHrs = runningHours;
    final double? calcEnergy = energyProductionKwh ??
        ((activePower > 0 && runHrs != null && runHrs > 0)
            ? double.parse((activePower * runHrs).toStringAsFixed(2))
            : null);

    final String normalizedStatus = unitStatus.toUpperCase() == 'SHUTDOWN'
        ? 'OFFLINE'
        : unitStatus.toUpperCase();

    return {
      'unit_id': unitId,
      'date': date, // YYYY-MM-DD
      'shift': shift.toUpperCase(), // PAGI, SIANG, MALAM
      'unit_status': normalizedStatus, // RUNNING, STANDBY, TRIP, OFFLINE
      'hour_meter_start': hourMeterStart,
      'hour_meter_end': hourMeterEnd,
      'running_hours': runHrs,
      'notes': notes.trim().isNotEmpty ? notes.trim() : null,
      'electrical': {
        'voltage_v': voltage > 0 ? voltage : null,
        'current_a': current > 0 ? current : null,
        'frequency_hz': frequency > 0 ? frequency : null,
        'active_power_kw': activePower >= 0 ? activePower : null,
        'power_factor': powerFactor > 0 ? powerFactor : null,
        'reactive_power_kvar': reactivePowerKvar,
        'energy_production_kwh': calcEnergy,
        'generator_status': generatorStatus,
      },
      'hydraulic': {
        'flow_rate_m3s': flowRate > 0 ? flowRate : null,
        'water_level_m': waterLevel > 0 ? waterLevel : null,
        'head_m': headM,
        'pressure_bar': pressureBar,
        'intake_condition': (intakeCondition != null && intakeCondition!.trim().isNotEmpty)
            ? intakeCondition!.trim()
            : null,
      },
      'mechanical': {
        'bearing_temp_c': bearingTemp > 0 ? bearingTemp : null,
        'rpm': rpm,
        'generator_temp_c': generatorTemp,
        'turbine_temp_c': turbineTemp,
        'vibration_mms': vibrationMms,
      },
    };
  }

  Map<String, dynamic> toJson() => toApiJson();

  LogbookModel copyWith({
    int? id,
    int? unitId,
    String? unitName,
    String? date,
    String? time,
    String? shift,
    String? unitStatus,
    String? operatorName,
    double? voltage,
    double? current,
    double? frequency,
    double? activePower,
    double? powerFactor,
    double? flowRate,
    double? waterLevel,
    double? bearingTemp,
    double? hourMeterStart,
    double? hourMeterEnd,
    double? energyProductionKwh,
    String? notes,
    List<String>? photos,
    double? reactivePowerKvar,
    double? rpm,
    double? generatorTemp,
    double? turbineTemp,
    double? vibrationMms,
    double? headM,
    double? pressureBar,
    String? intakeCondition,
    String? generatorStatus,
  }) {
    return LogbookModel(
      id: id ?? this.id,
      unitId: unitId ?? this.unitId,
      unitName: unitName ?? this.unitName,
      date: date ?? this.date,
      time: time ?? this.time,
      shift: shift ?? this.shift,
      unitStatus: unitStatus ?? this.unitStatus,
      operatorName: operatorName ?? this.operatorName,
      voltage: voltage ?? this.voltage,
      current: current ?? this.current,
      frequency: frequency ?? this.frequency,
      activePower: activePower ?? this.activePower,
      powerFactor: powerFactor ?? this.powerFactor,
      flowRate: flowRate ?? this.flowRate,
      waterLevel: waterLevel ?? this.waterLevel,
      bearingTemp: bearingTemp ?? this.bearingTemp,
      hourMeterStart: hourMeterStart ?? this.hourMeterStart,
      hourMeterEnd: hourMeterEnd ?? this.hourMeterEnd,
      energyProductionKwh: energyProductionKwh ?? this.energyProductionKwh,
      notes: notes ?? this.notes,
      photos: photos ?? this.photos,
      reactivePowerKvar: reactivePowerKvar ?? this.reactivePowerKvar,
      rpm: rpm ?? this.rpm,
      generatorTemp: generatorTemp ?? this.generatorTemp,
      turbineTemp: turbineTemp ?? this.turbineTemp,
      vibrationMms: vibrationMms ?? this.vibrationMms,
      headM: headM ?? this.headM,
      pressureBar: pressureBar ?? this.pressureBar,
      intakeCondition: intakeCondition ?? this.intakeCondition,
      generatorStatus: generatorStatus ?? this.generatorStatus,
    );
  }
}
