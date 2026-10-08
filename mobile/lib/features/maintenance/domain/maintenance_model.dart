class MaintenanceModel {
  final int id;
  final int unitId;
  final String unitName;
  final String date; // YYYY-MM-DD atau display date
  final String equipment;
  final String jobType; // work_type di database
  final String description;
  final String technician;
  final String status; // PLAN, PROCESS, COMPLETE
  final String? plannedDate;
  final String? createdAt;
  final String creatorName;
  final List<String> photos;

  const MaintenanceModel({
    required this.id,
    this.unitId = 1,
    this.unitName = 'Unit 1',
    required this.date,
    required this.equipment,
    required this.jobType,
    required this.description,
    this.technician = '',
    this.status = 'PLAN',
    this.plannedDate,
    this.createdAt,
    this.creatorName = 'Petugas',
    this.photos = const [],
  });

  MaintenanceModel copyWith({
    int? id,
    int? unitId,
    String? unitName,
    String? date,
    String? equipment,
    String? jobType,
    String? description,
    String? technician,
    String? status,
    String? plannedDate,
    String? createdAt,
    String? creatorName,
    List<String>? photos,
  }) {
    return MaintenanceModel(
      id: id ?? this.id,
      unitId: unitId ?? this.unitId,
      unitName: unitName ?? this.unitName,
      date: date ?? this.date,
      equipment: equipment ?? this.equipment,
      jobType: jobType ?? this.jobType,
      description: description ?? this.description,
      technician: technician ?? this.technician,
      status: status ?? this.status,
      plannedDate: plannedDate ?? this.plannedDate,
      createdAt: createdAt ?? this.createdAt,
      creatorName: creatorName ?? this.creatorName,
      photos: photos ?? this.photos,
    );
  }

  factory MaintenanceModel.fromJson(Map<String, dynamic> json) {
    final unitObj = json['unit'] as Map<String, dynamic>?;
    final creatorObj = json['creator'] as Map<String, dynamic>?;

    final rawPlanned = json['planned_date'] as String?;
    final rawCreated = json['created_at'] as String?;
    final rawDate = json['date'] as String? ?? rawPlanned ?? rawCreated ?? '';
    final formattedDate = rawDate.contains('T') ? rawDate.split('T')[0] : rawDate;

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

    return MaintenanceModel(
      id: json['id'] as int? ?? 0,
      unitId: json['unit_id'] as int? ?? (unitObj?['id'] as int? ?? 1),
      unitName: unitObj?['name'] as String? ?? (unitObj?['unit_code'] as String?) ?? 'Unit 1',
      date: formattedDate.isNotEmpty ? formattedDate : DateTime.now().toIso8601String().split('T')[0],
      equipment: json['equipment'] as String? ?? '',
      jobType: json['work_type'] as String? ?? (json['job_type'] as String? ?? ''),
      description: json['description'] as String? ?? '',
      technician: json['technician'] as String? ?? '',
      status: (json['status'] as String? ?? 'PLAN').toUpperCase(),
      plannedDate: rawPlanned,
      createdAt: rawCreated,
      creatorName: creatorObj?['full_name'] as String? ??
          creatorObj?['username'] as String? ??
          (json['creator_name'] as String? ?? 'Petugas'),
      photos: parsedPhotos,
    );
  }

  /// Payload sesuai createMaintenanceSchema di backend
  Map<String, dynamic> toApiJson() {
    String? validPlannedDate;
    if (plannedDate != null && plannedDate!.isNotEmpty) {
      validPlannedDate = plannedDate!.contains('T') ? plannedDate : '${plannedDate}T00:00:00.000Z';
    } else if (date.isNotEmpty) {
      validPlannedDate = date.contains('T') ? date : '${date}T00:00:00.000Z';
    }

    return {
      'unit_id': unitId,
      'equipment': equipment,
      'work_type': jobType,
      'description': description,
      'technician': technician.trim().isNotEmpty ? technician.trim() : null,
      'planned_date': validPlannedDate,
    };
  }

  Map<String, dynamic> toJson() => toApiJson();
}
