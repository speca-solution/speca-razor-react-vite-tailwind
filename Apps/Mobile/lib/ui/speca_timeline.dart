import 'package:flutter/material.dart';

import '../theme/speca_tokens.dart';

/// Satu langkah pada [SpecaStatusTimeline].
class SpecaTimelineStep {
  const SpecaTimelineStep({required this.title, this.detail});

  final String title;
  final String? detail;
}

/// Timeline status vertikal — untuk progres berurutan (pesanan, pengiriman,
/// approval, tahap proses). Langkah < [currentIndex] = selesai (centang),
/// = [currentIndex] = sedang berjalan (disorot), > = belum (redup).
class SpecaStatusTimeline extends StatelessWidget {
  const SpecaStatusTimeline({
    super.key,
    required this.steps,
    required this.currentIndex,
  });

  final List<SpecaTimelineStep> steps;
  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    const done = Color(0xFF17C653);

    return Column(
      children: List.generate(steps.length, (i) {
        final step = steps[i];
        final isDone = i < currentIndex;
        final isCurrent = i == currentIndex;
        final color = isDone ? done : (isCurrent ? c.primary : c.mutedForeground);
        final isLast = i == steps.length - 1;

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Rel: bulatan status + garis penghubung ke langkah berikutnya.
              Column(
                children: [
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: isDone || isCurrent ? color : Colors.transparent,
                      border: Border.all(color: color, width: 1.5),
                      shape: BoxShape.circle,
                    ),
                    child: isDone
                        ? const Icon(Icons.check, size: 13, color: Colors.white)
                        : (isCurrent
                            ? Center(
                                child: Container(
                                  width: 7,
                                  height: 7,
                                  decoration: const BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              )
                            : null),
                  ),
                  if (!isLast)
                    Expanded(
                      child: Container(
                        width: 2,
                        margin: const EdgeInsets.symmetric(vertical: 2),
                        color: isDone ? done : c.border,
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0 : 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step.title,
                        style: TextStyle(
                          color: isCurrent || isDone ? c.foreground : c.mutedForeground,
                          fontSize: 14,
                          fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w500,
                        ),
                      ),
                      if (step.detail != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            step.detail!,
                            style: TextStyle(color: c.mutedForeground, fontSize: 12),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
