class LogbookModel {
  final int id;
  final int unitId;
  final String date;
  final String time;
  final String shift; // PAGI, SIANG, MALAM
  final String unitStatus; // RUNNING, STANDBY, SHUTDOWN, TRIP
  final String operatorName;
  final double voltage; // V
  final double current; // A
  final double frequency; // Hz
  final double activePower; // kW
  final double powerFactor;
  final double flowRate; // m3/s
  final double waterLevel; // m
  final double bearingTemp; // °C
  final String notes;
  final List<String> photos;

  const LogbookModel({
    required this.id,
    this.unitId = 1,
    required this.date,
    this.time = '08:00',
    required this.shift,
    required this.unitStatus,
    this.operatorName = 'Andi Pratama',
    required this.voltage,
    required this.current,
    required this.frequency,
    required this.activePower,
    required this.powerFactor,
    required this.flowRate,
    required this.waterLevel,
    required this.bearingTemp,
    this.notes = 'Kondisi normal.',
    this.photos = const [],
  });

  factory LogbookModel.fromJson(Map<String, dynamic> json) {
    return LogbookModel(
      id: json['id'] as int? ?? 0,
      unitId: json['unit_id'] as int? ?? 1,
      date: json['date'] as String? ?? '12 Apr 2025',
      time: json['time'] as String? ?? '08:00',
      shift: json['shift'] as String? ?? 'PAGI',
      unitStatus: json['unit_status'] as String? ?? 'RUNNING',
      operatorName: json['operator_name'] as String? ?? 'Andi Pratama',
      voltage: (json['voltage'] as num?)?.toDouble() ?? 400.0,
      current: (json['current'] as num?)?.toDouble() ?? 820.0,
      frequency: (json['frequency'] as num?)?.toDouble() ?? 50.0,
      activePower: (json['active_power'] as num?)?.toDouble() ?? 450.0,
      powerFactor: (json['power_factor'] as num?)?.toDouble() ?? 0.98,
      flowRate: (json['flow_rate'] as num?)?.toDouble() ?? 2.50,
      waterLevel: (json['water_level'] as num?)?.toDouble() ?? 1.80,
      bearingTemp: (json['bearing_temp'] as num?)?.toDouble() ?? 52.0,
      notes: json['notes'] as String? ?? 'Kondisi normal.',
      photos: (json['photos'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'unit_id': unitId,
      'date': date,
      'time': time,
      'shift': shift,
      'unit_status': unitStatus,
      'operator_name': operatorName,
      'voltage': voltage,
      'current': current,
      'frequency': frequency,
      'active_power': activePower,
      'power_factor': powerFactor,
      'flow_rate': flowRate,
      'water_level': waterLevel,
      'bearing_temp': bearingTemp,
      'notes': notes,
      'photos': photos,
    };
  }

  LogbookModel copyWith({
    int? id,
    int? unitId,
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
    String? notes,
    List<String>? photos,
  }) {
    return LogbookModel(
      id: id ?? this.id,
      unitId: unitId ?? this.unitId,
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
      notes: notes ?? this.notes,
      photos: photos ?? this.photos,
    );
  }
}
