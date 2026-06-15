using Grpc.Core;
using Speca.Contracts.Greeter;

namespace Speca.Portal.Services;

/// <summary>
/// Implementasi server dari kontrak <c>greeter.proto</c> (base class di-generate
/// Grpc.Tools dari Libs/Contracts). Dipanggil klien React via gRPC-Web (same-origin),
/// lihat Pages/RpcDemo.cshtml + Assets/Entries/rpcdemo.tsx.
/// </summary>
public sealed class GreeterRpcService : GreeterService.GreeterServiceBase
{
    // Unary: validasi input + baca metadata auth (dikirim klien lewat interceptor).
    public override Task<SayHelloResponse> SayHello(SayHelloRequest request, ServerCallContext context)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            // Pemetaan error: status gRPC standar → klien menerima ConnectError berkode.
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Nama tidak boleh kosong."));
        }

        var hasToken = context.RequestHeaders.GetValue("authorization") is not null;
        var authNote = hasToken ? "token diterima" : "tanpa token";

        return Task.FromResult(new SayHelloResponse
        {
            Message = $"Halo, {request.Name}! Salam dari gRPC server (.NET 10) — {authNote}.",
            ServedAtUnixMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        });
    }

    // Server-streaming: kirim `count` tick (dibatasi 1..50), berhenti bila klien batal.
    public override async Task StreamTicks(
        StreamTicksRequest request,
        IServerStreamWriter<TickMessage> responseStream,
        ServerCallContext context)
    {
        var count = request.Count <= 0 ? 5 : Math.Min(request.Count, 50);
        for (var i = 1; i <= count && !context.CancellationToken.IsCancellationRequested; i++)
        {
            await responseStream.WriteAsync(new TickMessage
            {
                Index = i,
                AtUnixMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            });
            await Task.Delay(300, context.CancellationToken);
        }
    }
}
