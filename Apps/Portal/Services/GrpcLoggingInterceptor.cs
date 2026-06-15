using System.Diagnostics;
using Grpc.Core;
using Grpc.Core.Interceptors;

namespace Speca.Portal.Services;

/// <summary>
/// Interceptor lintas-cutting (server): mencatat setiap panggilan gRPC — method,
/// keberadaan token auth, durasi, dan status error. Pola yang sama bisa dipakai
/// untuk metrics/tracing. Didaftarkan di Program.cs via AddGrpc(o =&gt; o.Interceptors...).
/// </summary>
public sealed class GrpcLoggingInterceptor(ILogger<GrpcLoggingInterceptor> logger) : Interceptor
{
    public override async Task<TResponse> UnaryServerHandler<TRequest, TResponse>(
        TRequest request,
        ServerCallContext context,
        UnaryServerMethod<TRequest, TResponse> continuation)
    {
        var sw = Stopwatch.StartNew();
        var auth = context.RequestHeaders.GetValue("authorization") is null ? "anon" : "auth";
        try
        {
            return await continuation(request, context);
        }
        catch (RpcException ex)
        {
            logger.LogWarning("gRPC {Method} ({Auth}) GAGAL {Code} {Ms}ms", context.Method, auth, ex.StatusCode, sw.ElapsedMilliseconds);
            throw;
        }
        finally
        {
            logger.LogInformation("gRPC {Method} ({Auth}) {Ms}ms", context.Method, auth, sw.ElapsedMilliseconds);
        }
    }

    public override async Task ServerStreamingServerHandler<TRequest, TResponse>(
        TRequest request,
        IServerStreamWriter<TResponse> responseStream,
        ServerCallContext context,
        ServerStreamingServerMethod<TRequest, TResponse> continuation)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await continuation(request, responseStream, context);
        }
        finally
        {
            logger.LogInformation("gRPC stream {Method} {Ms}ms", context.Method, sw.ElapsedMilliseconds);
        }
    }
}
