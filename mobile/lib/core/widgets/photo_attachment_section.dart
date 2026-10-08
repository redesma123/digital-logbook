import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../network/api_url_helper.dart';
import '../services/image_picker_service.dart';

class PhotoAttachmentSection extends ConsumerWidget {
  final List<String> photos;
  final Function(String photoPath) onPhotoAdded;
  final Function(String photoPath) onPhotoRemoved;
  final int maxPhotos;
  final String label;

  const PhotoAttachmentSection({
    super.key,
    required this.photos,
    required this.onPhotoAdded,
    required this.onPhotoRemoved,
    this.maxPhotos = 5,
    this.label = 'Foto',
  });

  void _showFullImage(BuildContext context, String photoPath) {
    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (ctx) {
        final file = File(photoPath);
        final isLocalFile = file.existsSync();
        final isAsset = photoPath.startsWith('assets/');
        final resolvedUrl = isLocalFile ? '' : ApiUrlHelper.resolvePhotoUrl(photoPath);
        final isNetwork = !isLocalFile && !isAsset && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://'));

        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Stack(
            alignment: Alignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: InteractiveViewer(
                  maxScale: 4.0,
                  child: isLocalFile
                      ? Image.file(
                          file,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: const Color(0xFF1E293B),
                            padding: const EdgeInsets.all(40),
                            child: const Icon(Icons.broken_image, color: Colors.white54, size: 48),
                          ),
                        )
                      : isAsset
                          ? Image.asset(
                              photoPath,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => Container(
                                color: const Color(0xFF1E293B),
                                padding: const EdgeInsets.all(40),
                                child: const Icon(Icons.image, color: Colors.white54, size: 48),
                              ),
                            )
                          : isNetwork
                              ? Image.network(
                                  resolvedUrl,
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: const Color(0xFF1E293B),
                                    padding: const EdgeInsets.all(40),
                                    child: const Icon(Icons.broken_image, color: Colors.white54, size: 48),
                                  ),
                                )
                              : Image.file(
                                  file,
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: const Color(0xFF1E293B),
                                    padding: const EdgeInsets.all(40),
                                    child: const Icon(Icons.broken_image, color: Colors.white54, size: 48),
                                  ),
                                ),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: GestureDetector(
                  onTap: () => Navigator.pop(ctx),
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Colors.black54,
                      shape: BoxShape.circle,
                    ),
                    padding: const EdgeInsets.all(8),
                    child: const Icon(Icons.close, color: Colors.white, size: 20),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _handlePickImage(BuildContext context, WidgetRef ref) async {
    if (photos.length >= maxPhotos) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Batas maksimal $maxPhotos foto tercapai.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final pickerService = ref.read(imagePickerServiceProvider);
    final pickedFile = await pickerService.showImageSourceDialog(context);

    if (pickedFile != null) {
      onPhotoAdded(pickedFile.path);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Foto berhasil ditambahkan (Total: ${photos.length + 1})'),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 1),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.neutral700,
              ),
            ),
            Text(
              '${photos.length}/$maxPhotos foto',
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.neutral500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 76,
          child: ListView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            children: [
              ...photos.map((photoPath) {
                final file = File(photoPath);
                final isLocalFile = file.existsSync();
                final isAsset = photoPath.startsWith('assets/');
                final resolvedUrl = isLocalFile ? '' : ApiUrlHelper.resolvePhotoUrl(photoPath);
                final isNetwork = !isLocalFile && !isAsset && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://'));

                return Container(
                  width: 76,
                  height: 76,
                  margin: const EdgeInsets.only(right: 10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.neutral300),
                    color: AppColors.neutral100,
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(9),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        GestureDetector(
                          onTap: () => _showFullImage(context, photoPath),
                          child: isLocalFile
                              ? Image.file(
                                  file,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: const Color(0xFF1E293B),
                                    child: const Center(
                                      child: Icon(Icons.broken_image, color: Colors.white54, size: 24),
                                    ),
                                  ),
                                )
                              : isAsset
                                  ? Image.asset(
                                      photoPath,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) => Container(
                                        color: const Color(0xFF1E293B),
                                        child: const Center(
                                          child: Icon(Icons.image, color: Colors.white54, size: 24),
                                        ),
                                      ),
                                    )
                                  : isNetwork
                                      ? Image.network(
                                          resolvedUrl,
                                          fit: BoxFit.cover,
                                          errorBuilder: (context, error, stackTrace) => Container(
                                            color: const Color(0xFF1E293B),
                                            child: const Center(
                                              child: Icon(Icons.broken_image, color: Colors.white54, size: 24),
                                            ),
                                          ),
                                        )
                                      : Image.file(
                                          file,
                                          fit: BoxFit.cover,
                                          errorBuilder: (context, error, stackTrace) => Container(
                                            color: const Color(0xFF1E293B),
                                            child: const Center(
                                              child: Icon(Icons.image_not_supported, color: Colors.white54, size: 24),
                                            ),
                                          ),
                                        ),
                        ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: GestureDetector(
                            onTap: () => onPhotoRemoved(photoPath),
                            child: Container(
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              padding: const EdgeInsets.all(3),
                              child: const Icon(Icons.close, size: 13, color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              if (photos.length < maxPhotos)
                InkWell(
                  onTap: () => _handlePickImage(context, ref),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: const Color(0xFF0284C7).withValues(alpha: 0.5),
                        width: 1.5,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.camera_alt_rounded,
                          size: 26,
                          color: Color(0xFF0284C7),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tambah',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF0284C7),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
