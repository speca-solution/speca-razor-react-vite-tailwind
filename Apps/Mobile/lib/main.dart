import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:grpc/grpc.dart';

import 'gen/greeter.pbgrpc.dart';
import 'screens/ui_kit_demo.dart';
import 'theme/speca_theme.dart';
import 'theme/speca_tokens.dart';

/// Host server Portal dilihat dari emulator Android: 10.0.2.2 = loopback mesin host.
/// Perangkat fisik: `--dart-define=SPECA_HOST=<IP-LAN-mesin-dev>`.
/// Port 7251 = profil launch `https` Portal (gRPC & HTTPS butuh HTTP/2 → TLS).
const String kServerHost =
    String.fromEnvironment('SPECA_HOST', defaultValue: '10.0.2.2');
const int kServerPort = int.fromEnvironment('SPECA_PORT', defaultValue: 7251);

/// Kredensial TLS gRPC — self-signed dev DITERIMA hanya di debug (release = validasi
/// penuh; guard struktural menutup celah MITM). Lihat [_httpClient] untuk HTTP.
ChannelCredentials _grpcCredentials() => kDebugMode
    ? ChannelCredentials.secure(onBadCertificate: (cert, host) => true)
    : const ChannelCredentials.secure();

HttpClient _httpClient() {
  final c = HttpClient();
  if (kDebugMode) {
    c.badCertificateCallback = (cert, host, port) => true; // dev self-signed saja
  }
  return c;
}

void main() => runApp(const SpecaMobileApp());

class SpecaMobileApp extends StatelessWidget {
  const SpecaMobileApp({super.key});

  /// Varian tema mengikuti sumbu yang sama dengan web (theme1 Metronic /
  /// theme2 Vuexy). Ganti lewat `--dart-define=SPECA_THEME=theme2`.
  static SpecaThemeVariant get _variant =>
      const String.fromEnvironment('SPECA_THEME', defaultValue: 'theme1') == 'theme2'
          ? SpecaThemeVariant.theme2
          : SpecaThemeVariant.theme1;

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Speca Mobile',
        theme: buildSpecaTheme(_variant),
        darkTheme: buildSpecaTheme(_variant, brightness: Brightness.dark),
        home: const HomeShell(),
      );
}

/// Kerangka utama dengan bottom navigation — pola dasar aplikasi mobile
/// (beberapa tab tingkat atas). NavigationBar bergaya otomatis dari token tema.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) => Scaffold(
        body: IndexedStack(
          index: _index,
          // autoRun:false → tak mencoba login saat app dibuka (server mungkin
          // belum jalan); pengguna menekan Login sendiri.
          children: const [UiKitDemoPage(), AuthDemoPage(autoRun: false)],
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (i) => setState(() => _index = i),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.widgets_outlined),
              selectedIcon: Icon(Icons.widgets),
              label: 'UI Kit',
            ),
            NavigationDestination(
              icon: Icon(Icons.lock_outline),
              selectedIcon: Icon(Icons.lock),
              label: 'Auth gRPC',
            ),
          ],
        ),
      );
}

// ─────────────────────────── Penyimpanan token aman ───────────────────────────

/// Token disimpan di Android Keystore / iOS Keychain via flutter_secure_storage —
/// BUKAN SharedPreferences (yang plaintext). Access token pendek; refresh dirotasi.
class TokenStore {
  // Android: enkripsi via cipher default (Keystore-backed); iOS: Keychain.
  static const _storage = FlutterSecureStorage();
  static const _kAccess = 'speca.access';
  static const _kRefresh = 'speca.refresh';

  Future<void> save(String access, String refresh) async {
    await _storage.write(key: _kAccess, value: access);
    await _storage.write(key: _kRefresh, value: refresh);
  }

  Future<String?> get access => _storage.read(key: _kAccess);
  Future<String?> get refresh => _storage.read(key: _kRefresh);

  Future<void> clear() async {
    await _storage.delete(key: _kAccess);
    await _storage.delete(key: _kRefresh);
  }
}

// ─────────────────────────── API token (HTTP /auth) ───────────────────────────

class AuthApi {
  final TokenStore _store;
  AuthApi(this._store);

  Uri _uri(String path) => Uri.https('$kServerHost:$kServerPort', path);

  Future<bool> login(String email, String password) async {
    final res = await _postJson('/auth/login', {'email': email, 'password': password});
    if (res == null) return false;
    await _store.save(res['accessToken'] as String, res['refreshToken'] as String);
    return true;
  }

  /// Rotasi access token pakai refresh token tersimpan. Mengembalikan access baru
  /// atau null bila refresh ditolak (mis. reuse/kedaluwarsa → user harus login ulang).
  Future<String?> refresh() async {
    final rt = await _store.refresh;
    if (rt == null) return null;
    final res = await _postJson('/auth/refresh', {'refreshToken': rt});
    if (res == null) {
      await _store.clear();
      return null;
    }
    final access = res['accessToken'] as String;
    await _store.save(access, res['refreshToken'] as String);
    return access;
  }

  Future<void> logout() async {
    final rt = await _store.refresh;
    if (rt != null) {
      await _postJson('/auth/logout', {'refreshToken': rt});
    }
    await _store.clear();
  }

  Future<Map<String, dynamic>?> _postJson(String path, Map<String, dynamic> body) async {
    final client = _httpClient();
    try {
      final req = await client.postUrl(_uri(path));
      req.headers.contentType = ContentType.json;
      req.add(utf8.encode(jsonEncode(body)));
      final res = await req.close();
      final text = await res.transform(utf8.decoder).join();
      if (res.statusCode != 200) return null;
      return jsonDecode(text) as Map<String, dynamic>;
    } catch (_) {
      return null;
    } finally {
      client.close();
    }
  }
}

// ─────────────────── Klien gRPC dgn Bearer + auto-refresh 401 ──────────────────

class GreeterClient {
  final TokenStore _store;
  final AuthApi _auth;
  GreeterClient(this._store, this._auth);

  ClientChannel _channel() => ClientChannel(
        kServerHost,
        port: kServerPort,
        options: ChannelOptions(credentials: _grpcCredentials()),
      );

  Future<CallOptions> _authOptions() async {
    final access = await _store.access;
    return CallOptions(
      metadata: access == null ? {} : {'authorization': 'Bearer $access'},
      timeout: const Duration(seconds: 15),
    );
  }

  /// StreamTicks BUTUH token valid ([Authorize] di server). Bila ditolak (token
  /// kedaluwarsa), coba refresh SEKALI lalu ulangi — pola auto-refresh.
  Stream<int> streamTicks(int count) async* {
    final channel = _channel();
    try {
      final client = GreeterServiceClient(channel);
      try {
        await for (final t in client.streamTicks(StreamTicksRequest()..count = count,
            options: await _authOptions())) {
          yield t.index;
        }
      } on GrpcError catch (e) {
        // Kemungkinan token kedaluwarsa → refresh sekali, ulangi.
        if (e.code == StatusCode.unauthenticated || e.code == StatusCode.internal) {
          final newAccess = await _auth.refresh();
          if (newAccess == null) rethrow;
          await for (final t in client.streamTicks(StreamTicksRequest()..count = count,
              options: await _authOptions())) {
            yield t.index;
          }
        } else {
          rethrow;
        }
      }
    } finally {
      await channel.shutdown();
    }
  }
}

// ─────────────────────────────────── UI ───────────────────────────────────────

class AuthDemoPage extends StatefulWidget {
  const AuthDemoPage({super.key, this.autoRun = true});

  /// Dimatikan di widget test (tanpa jaringan/secure-storage native).
  final bool autoRun;

  @override
  State<AuthDemoPage> createState() => _AuthDemoPageState();
}

class _AuthDemoPageState extends State<AuthDemoPage> {
  late final TokenStore _store = TokenStore();
  late final AuthApi _auth = AuthApi(_store);
  late final GreeterClient _greeter = GreeterClient(_store, _auth);

  final _email = TextEditingController(text: 'demo@speca.test');
  final _password = TextEditingController(text: 'Demo!2345');

  bool _loggedIn = false;
  bool _busy = false;
  String _status = 'Belum login';
  final List<int> _ticks = [];

  @override
  void initState() {
    super.initState();
    // Demo: rantai penuh otomatis (login → panggilan gRPC ber-auth) untuk bukti
    // end-to-end tanpa interaksi. Dimatikan di widget test (autoRun:false).
    if (widget.autoRun) {
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        await _login();
        if (_loggedIn) await _callAuthedStream();
      });
    }
  }

  Future<void> _login() async {
    setState(() {
      _busy = true;
      _status = 'Login…';
    });
    final ok = await _auth.login(_email.text, _password.text);
    setState(() {
      _busy = false;
      _loggedIn = ok;
      _status = ok ? 'Login sukses — token tersimpan aman' : 'Login GAGAL (401)';
    });
  }

  Future<void> _callAuthedStream() async {
    setState(() {
      _busy = true;
      _ticks.clear();
      _status = 'Memanggil StreamTicks (butuh auth)…';
    });
    try {
      await for (final i in _greeter.streamTicks(4)) {
        setState(() => _ticks.add(i));
      }
      setState(() => _status = 'StreamTicks OK — ${_ticks.length} tick ber-auth');
    } on GrpcError catch (e) {
      setState(() => _status = 'gRPC ${e.codeName}: ${e.message}');
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _logout() async {
    await _auth.logout();
    setState(() {
      _loggedIn = false;
      _ticks.clear();
      _status = 'Logout — token dicabut';
    });
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Speca Mobile — Auth gRPC')),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Server: $kServerHost:$kServerPort',
                  style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 16),
              TextField(
                controller: _email,
                decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _password,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _busy || _loggedIn ? null : _login,
                      icon: const Icon(Icons.login),
                      label: const Text('Login'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _busy || !_loggedIn ? null : _logout,
                      icon: const Icon(Icons.logout),
                      label: const Text('Logout'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _busy || !_loggedIn ? null : _callAuthedStream,
                icon: _busy
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.stream),
                label: const Text('Panggil StreamTicks (ber-auth)'),
              ),
              const SizedBox(height: 24),
              Card(
                child: ListTile(
                  leading: Icon(_loggedIn ? Icons.lock_open : Icons.lock, color: _loggedIn ? Colors.green : Colors.grey),
                  title: Text(_status),
                  subtitle: _ticks.isEmpty ? null : Text('Tick: ${_ticks.join(", ")}'),
                ),
              ),
            ],
          ),
        ),
      );
}
