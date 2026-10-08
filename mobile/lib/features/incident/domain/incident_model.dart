class IncidentModel {
  final int id;
  final int unitId;
  final String unitName;
  final String dateTime; // format ISO YYYY-MM-DDTHH:mm:ss atau display
  final String equipment;
  final String incidentType;
  final String description;
  final String operatorAction;
  final String status; // OPEN, PROCESS, CLOSED
  final String reporterName;
  final String? resolvedAt;
  final List<String> photos;

  const IncidentModel({
    required this.id,
    this.unitId = 1,
    this.unitName = 'Unit 1',
    required this.dateTime,
    required this.equipment,
    required this.incidentType,
    required this.description,
    required this.operatorAction,
    this.status = 'OPEN',
    this.reporterName = 'Petugas',
    this.resolvedAt,
    this.photos = const [],
  });

  IncidentModel copyWith({
    int? id,
    int? unitId,
    String? unitName,
    String? dateTime,
    String? equipment,
    String? incidentType,
    String? description,
    String? operatorAction,
    String? status,
    String? reporterName,
    String? resolvedAt,
    List<String>? photos,
  }) {
    return IncidentModel(
      id: id ?? this.id,
      unitId: unitId ?? this.unitId,
      unitName: unitName ?? this.unitName,
      dateTime: dateTime ?? this.dateTime,
      equipment: equipment ?? this.equipment,
      incidentType: incidentType ?? this.incidentType,
      description: description ?? this.description,
      operatorAction: operatorAction ?? this.operatorAction,
      status: status ?? this.status,
      reporterName: reporterName ?? this.reporterName,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      photos: photos ?? this.photos,
    );
  }

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    final unitObj = json['unit'] as Map<String, dynamic>?;
    final reporterObj = json['reporter'] as Map<String, dynamic>?;

    final rawOccurred = json['occurred_at'] as String?;
    final rawDate = json['dateTime'] as String? ?? rawOccurred ?? (json['created_at'] as String? ?? '');

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

    return IncidentModel(
      id: json['id'] as int? ?? 0,
      unitId: json['unit_id'] as int? ?? (unitObj?['id'] as int? ?? 1),
      unitName: unitObj?['name'] as String? ?? (unitObj?['unit_code'] as String?) ?? 'Unit 1',
      dateTime: rawDate.isNotEmpty ? rawDate : DateTime.now().toIso8601String(),
      equipment: json['equipment'] as String? ?? '',
      incidentType: json['incident_type'] as String? ?? '',
      description: json['description'] as String? ?? '',
      operatorAction: json['operator_action'] as String? ?? '',
      status: (json['status'] as String? ?? 'OPEN').toUpperCase(),
      reporterName: reporterObj?['full_name'] as String? ??
          reporterObj?['username'] as String? ??
          (json['reporter_name'] as String? ?? 'Petugas'),
      resolvedAt: json['resolved_at'] as String?,
      photos: parsedPhotos,
    );
  }

  /// Payload sesuai createIncidentSchema di backend
  Map<String, dynamic> toApiJson() {
    String validIsoDate;
    if (dateTime.contains('T')) {
      validIsoDate = dateTime;
    } else {
      try {
        final parsed = DateTime.parse(dateTime);
        validIsoDate = parsed.toIso8601String();
      } catch (_) {
        validIsoDate = DateTime.now().toIso8601String();
      }
    }

    return {
      'unit_id': unitId,
      'occurred_at': validIsoDate,
      'equipment': equipment,
      'incident_type': incidentType,
      'description': description,
      'operator_action': operatorAction.trim().isNotEmpty ? operatorAction.trim() : null,
    };
  }

  Map<String, dynamic> toJson() => toApiJson();
}
