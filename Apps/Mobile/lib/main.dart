import 'package:flutter/material.dart';
import 'package:grpc/grpc.dart';

import 'gen/greeter.pbgrpc.dart';

/// Host server Portal dilihat dari emulator Android: 10.0.2.2 = loopback mesin host.
/// Perangkat fisik: jalankan dengan `--dart-define=SPECA_HOST=<IP-LAN-mesin-dev>`.
/// Port 7251 = profil launch `https` Portal (gRPC butuh HTTP/2, di dev berarti TLS).
const String kServerHost =
    String.fromEnvironment('SPECA_HOST', defaultValue: '10.0.2.2');
const int kServerPort = int.fromEnvironment('SPECA_PORT', defaultValue: 7251);

void main() => runApp(const SpecaMobileApp());

class SpecaMobileApp extends StatelessWidget {
  const SpecaMobileApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Speca Mobile',
        theme: ThemeData(colorSchemeSeed: Colors.blue, useMaterial3: true),
        home: const GreeterPage(),
      );
}

/// Demo kontrak lintas-bahasa: satu `greeter.proto` = server C# + klien TS + klien Dart.
/// Klien Dart di `lib/gen/` di-generate `pnpm buf:generate` (JANGAN diedit manual).
class GreeterPage extends StatefulWidget {
  const GreeterPage({super.key});

  @override
  State<GreeterPage> createState() => _GreeterPageState();
}

class _GreeterPageState extends State<GreeterPage> {
  final _name = TextEditingController(text: 'Speca Mobile');
  String? _reply;
  String? _error;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _sayHello(); // panggil langsung saat app dibuka — bukti round-trip tanpa interaksi
  }

  Future<void> _sayHello() async {
    setState(() {
      _busy = true;
      _reply = null;
      _error = null;
    });
    final channel = ClientChannel(
      kServerHost,
      port: kServerPort,
      options: ChannelOptions(
        // Dev-only: terima sertifikat dev ASP.NET (self-signed). Produksi harus
        // memakai sertifikat valid dan menghapus onBadCertificate.
        credentials:
            ChannelCredentials.secure(onBadCertificate: (cert, host) => true),
      ),
    );
    try {
      final client = GreeterServiceClient(channel);
      final res = await client.sayHello(
        SayHelloRequest()..name = _name.text,
        options: CallOptions(timeout: const Duration(seconds: 10)),
      );
      setState(() => _reply =
          '${res.message}\nserved_at_unix_ms: ${res.servedAtUnixMs}');
    } on GrpcError catch (e) {
      setState(() => _error = 'gRPC ${e.codeName}: ${e.message}');
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      await channel.shutdown();
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Speca Mobile — Demo gRPC')),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Server: $kServerHost:$kServerPort (greeter.v1/SayHello)',
                  style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 16),
              TextField(
                controller: _name,
                decoration: const InputDecoration(
                  labelText: 'Nama',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _busy ? null : _sayHello,
                icon: _busy
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.send),
                label: const Text('SayHello'),
              ),
              const SizedBox(height: 24),
              if (_reply != null)
                Card(
                  child: ListTile(
                    leading:
                        const Icon(Icons.check_circle, color: Colors.green),
                    title: Text(_reply!),
                  ),
                ),
              if (_error != null)
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.error, color: Colors.red),
                    title: Text(_error!),
                  ),
                ),
            ],
          ),
        ),
      );
}
