// Smoke test UI: halaman Greeter tampil dengan field nama + tombol SayHello.
// autoConnect:false → tanpa koneksi gRPC / timer tertinggal (test tanpa server).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:speca_mobile/main.dart';

void main() {
  testWidgets('GreeterPage renders', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: GreeterPage(autoConnect: false)),
    );

    expect(find.text('Speca Mobile — Demo gRPC'), findsOneWidget);
    expect(find.text('SayHello'), findsOneWidget);
  });
}
