class IncidentModel {
  final int id;
  final int unitId;
  final String dateTime;
  final String equipment; // Generator, Turbin, Intake, Panel Kontrol
  final String incidentType; // Trip, Turbine Vibration, Intake Tersumbat, dll.
  final String description;
  final String operatorAction;
  final String status; // OPEN, PROCESS, CLOSED
  final String reporterName;
  final List<String> photos;

  const IncidentModel({
    required this.id,
    this.unitId = 1,
    required this.dateTime,
    required this.equipment,
    required this.incidentType,
    required this.description,
    required this.operatorAction,
    this.status = 'OPEN',
    this.reporterName = 'Andi Pratama',
    this.photos = const [],
  });

  IncidentModel copyWith({
    int? id,
    int? unitId,
    String? dateTime,
    String? equipment,
    String? incidentType,
    String? description,
    String? operatorAction,
    String? status,
    String? reporterName,
    List<String>? photos,
  }) {
    return IncidentModel(
      id: id ?? this.id,
      unitId: unitId ?? this.unitId,
      dateTime: dateTime ?? this.dateTime,
      equipment: equipment ?? this.equipment,
      incidentType: incidentType ?? this.incidentType,
      description: description ?? this.description,
      operatorAction: operatorAction ?? this.operatorAction,
      status: status ?? this.status,
      reporterName: reporterName ?? this.reporterName,
      photos: photos ?? this.photos,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'unit_id': unitId,
      'dateTime': dateTime,
      'equipment': equipment,
      'incident_type': incidentType,
      'description': description,
      'operator_action': operatorAction,
      'status': status,
      'reporter_name': reporterName,
      'photos': photos,
    };
  }

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    return IncidentModel(
      id: json['id'] as int? ?? 0,
      unitId: json['unit_id'] as int? ?? 1,
      dateTime: json['dateTime'] as String? ?? '12 Apr 2025 14:25',
      equipment: json['equipment'] as String? ?? 'Generator',
      incidentType: json['incident_type'] as String? ?? 'Trip',
      description: json['description'] as String? ?? '',
      operatorAction: json['operator_action'] as String? ?? '',
      status: json['status'] as String? ?? 'OPEN',
      reporterName: json['reporter_name'] as String? ?? 'Andi Pratama',
      photos: (json['photos'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  static List<IncidentModel> get mockIncidents => [
        const IncidentModel(
          id: 1,
          dateTime: '12 Apr 2025 14:25',
          equipment: 'Generator',
          incidentType: 'Generator Trip',
          description: 'Generator trip karena over current.',
          operatorAction: 'Cek proteksi dan reset.',
          status: 'OPEN',
          photos: ['assets/images/photo_placeholder.jpg'],
        ),
        const IncidentModel(
          id: 2,
          dateTime: '08 Apr 2025 10:15',
          equipment: 'Turbin',
          incidentType: 'Turbine Vibration',
          description: 'Vibrasi turbin tinggi.',
          operatorAction: 'Pengecekan bearing dan pelumasan.',
          status: 'PROCESS',
          photos: [],
        ),
        const IncidentModel(
          id: 3,
          dateTime: '05 Apr 2025 16:40',
          equipment: 'Intake',
          incidentType: 'Intake Tersumbat',
          description: 'Sampah menumpuk di saringan intake.',
          operatorAction: 'Pembersihan trash rack intake.',
          status: 'CLOSED',
          photos: [],
        ),
        const IncidentModel(
          id: 4,
          dateTime: '01 Apr 2025 09:20',
          equipment: 'Panel Kontrol',
          incidentType: 'Panel Kontrol',
          description: 'Alarm komunikasi terputus.',
          operatorAction: 'Reset modul PLC dan kabel RS485.',
          status: 'CLOSED',
          photos: [],
        ),
      ];
}
