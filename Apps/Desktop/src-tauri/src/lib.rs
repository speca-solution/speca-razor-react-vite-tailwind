// Shell desktop Speca: di release, jalankan server Portal (dotnet self-contained)
// sebagai proses samping di port lokal acak, lalu arahkan webview ke sana.
// Di debug (`tauri dev`), sidecar TIDAK dipakai — webview memuat devUrl
// (beforeDevCommand `dotnet run` Portal, lihat tauri.conf.json).
use std::{
  net::{TcpListener, TcpStream},
  process::{Child, Command},
  sync::Mutex,
  time::{Duration, Instant},
};

use tauri::{Manager, RunEvent};

struct PortalChild(Mutex<Option<Child>>);

fn free_port() -> u16 {
  TcpListener::bind("127.0.0.1:0")
    .expect("gagal bind port lokal")
    .local_addr()
    .expect("gagal baca port lokal")
    .port()
}

fn wait_listening(port: u16, timeout: Duration) -> bool {
  let start = Instant::now();
  while start.elapsed() < timeout {
    if TcpStream::connect(("127.0.0.1", port)).is_ok() {
      return true;
    }
    std::thread::sleep(Duration::from_millis(200));
  }
  false
}

fn show_error(window: &tauri::WebviewWindow, message: &str) {
  let _ = window.eval(&format!(
    "document.body.innerHTML = '<p style=\"font-family:system-ui;padding:2rem;color:#b91c1c\">{}</p>'",
    message.replace('\'', "\\'")
  ));
}

fn spawn_portal_and_navigate(handle: tauri::AppHandle) {
  let window = handle
    .get_webview_window("main")
    .expect("window utama tidak ditemukan");

  let portal_dir = match handle.path().resource_dir() {
    Ok(dir) => dir.join("portal"),
    Err(e) => {
      show_error(&window, &format!("Resource dir tidak terbaca: {e}"));
      return;
    }
  };
  let exe = portal_dir.join("Speca.Portal.exe");
  if !exe.exists() {
    show_error(
      &window,
      "Speca.Portal.exe tidak ditemukan di resources — jalankan build via `pnpm --filter @speca/desktop build`.",
    );
    return;
  }

  let port = free_port();
  let url = format!("http://127.0.0.1:{port}");

  let mut cmd = Command::new(&exe);
  cmd
    .current_dir(&portal_dir) // WAJIB: ContentRoot/WebRoot ikut cwd (lihat CLAUDE.md "Run/smoke gotchas")
    .args([
      "--urls",
      &url,
      "--AllowedHosts", // env var tidak dibaca; harus arg CLI (gotcha terverifikasi)
      "127.0.0.1",
      "--Hosting:HttpsRedirect", // webview memuat http lokal; tak ada endpoint TLS
      "false",
    ])
    .env("ASPNETCORE_ENVIRONMENT", "Production");
  #[cfg(windows)]
  {
    use std::os::windows::process::CommandExt;
    cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW: jangan buka jendela console
  }

  let child = match cmd.spawn() {
    Ok(c) => c,
    Err(e) => {
      show_error(&window, &format!("Gagal menjalankan server Portal: {e}"));
      return;
    }
  };
  *handle.state::<PortalChild>().0.lock().unwrap() = Some(child);

  if !wait_listening(port, Duration::from_secs(30)) {
    show_error(&window, "Server Portal tidak siap dalam 30 detik.");
    return;
  }
  let parsed = url.parse().expect("URL sidecar tidak valid");
  if let Err(e) = window.navigate(parsed) {
    show_error(&window, &format!("Gagal membuka {url}: {e}"));
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let app = tauri::Builder::default()
    .manage(PortalChild(Mutex::new(None)))
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      } else {
        // Async agar window + splash (frontendDist) tampil selagi server boot.
        let handle = app.handle().clone();
        std::thread::spawn(move || spawn_portal_and_navigate(handle));
      }
      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

  app.run(|app_handle, event| {
    if let RunEvent::Exit = event {
      if let Some(mut child) = app_handle
        .state::<PortalChild>()
        .0
        .lock()
        .unwrap()
        .take()
      {
        let _ = child.kill();
        let _ = child.wait();
      }
    }
  });
}
