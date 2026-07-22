// Smoke test UI: halaman auth tampil dengan field kredensial + tombol.
// autoRun:false → tanpa jaringan/secure-storage native (test murni widget).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:speca_mobile/main.dart';

void main() {
  testWidgets('AuthDemoPage renders', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: AuthDemoPage(autoRun: false)),
    );

    expect(find.text('Speca Mobile — Auth gRPC'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Panggil StreamTicks (ber-auth)'), findsOneWidget);
  });
}
