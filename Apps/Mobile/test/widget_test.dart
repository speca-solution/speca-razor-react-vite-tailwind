// Smoke test UI: halaman Greeter tampil dengan field nama + tombol SayHello.
// (Panggilan gRPC di initState akan gagal di lingkungan test — itu tampil sebagai
// kartu error dan tidak menggagalkan render.)
import 'package:flutter_test/flutter_test.dart';

import 'package:speca_mobile/main.dart';

void main() {
  testWidgets('GreeterPage renders', (WidgetTester tester) async {
    await tester.pumpWidget(const SpecaMobileApp());

    expect(find.text('Speca Mobile — Demo gRPC'), findsOneWidget);
    expect(find.text('SayHello'), findsOneWidget);
  });
}
