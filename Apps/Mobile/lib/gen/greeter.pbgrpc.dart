// This is a generated file - do not edit.
//
// Generated from greeter.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports

import 'dart:async' as $async;
import 'dart:core' as $core;

import 'package:grpc/service_api.dart' as $grpc;
import 'package:protobuf/protobuf.dart' as $pb;

import 'greeter.pb.dart' as $0;

export 'greeter.pb.dart';

/// Contoh layanan: unary + server-streaming. Tambahkan service/method lain di
/// file .proto baru dalam folder ini; C# & TS otomatis ikut ter-generate.
@$pb.GrpcServiceName('greeter.v1.GreeterService')
class GreeterServiceClient extends $grpc.Client {
  /// The hostname for this service.
  static const $core.String defaultHost = '';

  /// OAuth scopes needed for the client.
  static const $core.List<$core.String> oauthScopes = [
    '',
  ];

  GreeterServiceClient(super.channel, {super.options, super.interceptors});

  /// Unary. Memvalidasi input (name kosong → InvalidArgument) & membaca metadata auth.
  $grpc.ResponseFuture<$0.SayHelloResponse> sayHello(
    $0.SayHelloRequest request, {
    $grpc.CallOptions? options,
  }) {
    return $createUnaryCall(_$sayHello, request, options: options);
  }

  /// Server-streaming: kirim `count` tick berurutan (untuk live update di klien).
  $grpc.ResponseStream<$0.TickMessage> streamTicks(
    $0.StreamTicksRequest request, {
    $grpc.CallOptions? options,
  }) {
    return $createStreamingCall(
        _$streamTicks, $async.Stream.fromIterable([request]),
        options: options);
  }

  // method descriptors

  static final _$sayHello =
      $grpc.ClientMethod<$0.SayHelloRequest, $0.SayHelloResponse>(
          '/greeter.v1.GreeterService/SayHello',
          ($0.SayHelloRequest value) => value.writeToBuffer(),
          $0.SayHelloResponse.fromBuffer);
  static final _$streamTicks =
      $grpc.ClientMethod<$0.StreamTicksRequest, $0.TickMessage>(
          '/greeter.v1.GreeterService/StreamTicks',
          ($0.StreamTicksRequest value) => value.writeToBuffer(),
          $0.TickMessage.fromBuffer);
}

@$pb.GrpcServiceName('greeter.v1.GreeterService')
abstract class GreeterServiceBase extends $grpc.Service {
  $core.String get $name => 'greeter.v1.GreeterService';

  GreeterServiceBase() {
    $addMethod($grpc.ServiceMethod<$0.SayHelloRequest, $0.SayHelloResponse>(
        'SayHello',
        sayHello_Pre,
        false,
        false,
        ($core.List<$core.int> value) => $0.SayHelloRequest.fromBuffer(value),
        ($0.SayHelloResponse value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.StreamTicksRequest, $0.TickMessage>(
        'StreamTicks',
        streamTicks_Pre,
        false,
        true,
        ($core.List<$core.int> value) =>
            $0.StreamTicksRequest.fromBuffer(value),
        ($0.TickMessage value) => value.writeToBuffer()));
  }

  $async.Future<$0.SayHelloResponse> sayHello_Pre($grpc.ServiceCall $call,
      $async.Future<$0.SayHelloRequest> $request) async {
    return sayHello($call, await $request);
  }

  $async.Future<$0.SayHelloResponse> sayHello(
      $grpc.ServiceCall call, $0.SayHelloRequest request);

  $async.Stream<$0.TickMessage> streamTicks_Pre($grpc.ServiceCall $call,
      $async.Future<$0.StreamTicksRequest> $request) async* {
    yield* streamTicks($call, await $request);
  }

  $async.Stream<$0.TickMessage> streamTicks(
      $grpc.ServiceCall call, $0.StreamTicksRequest request);
}
