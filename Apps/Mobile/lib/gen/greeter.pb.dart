// This is a generated file - do not edit.
//
// Generated from greeter.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports

import 'dart:core' as $core;

import 'package:fixnum/fixnum.dart' as $fixnum;
import 'package:protobuf/protobuf.dart' as $pb;

export 'package:protobuf/protobuf.dart' show GeneratedMessageGenericExtensions;

class SayHelloRequest extends $pb.GeneratedMessage {
  factory SayHelloRequest({
    $core.String? name,
  }) {
    final result = create();
    if (name != null) result.name = name;
    return result;
  }

  SayHelloRequest._();

  factory SayHelloRequest.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory SayHelloRequest.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'SayHelloRequest',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'greeter.v1'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'name')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  SayHelloRequest clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  SayHelloRequest copyWith(void Function(SayHelloRequest) updates) =>
      super.copyWith((message) => updates(message as SayHelloRequest))
          as SayHelloRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static SayHelloRequest create() => SayHelloRequest._();
  @$core.override
  SayHelloRequest createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static SayHelloRequest getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<SayHelloRequest>(create);
  static SayHelloRequest? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get name => $_getSZ(0);
  @$pb.TagNumber(1)
  set name($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasName() => $_has(0);
  @$pb.TagNumber(1)
  void clearName() => $_clearField(1);
}

class SayHelloResponse extends $pb.GeneratedMessage {
  factory SayHelloResponse({
    $core.String? message,
    $fixnum.Int64? servedAtUnixMs,
  }) {
    final result = create();
    if (message != null) result.message = message;
    if (servedAtUnixMs != null) result.servedAtUnixMs = servedAtUnixMs;
    return result;
  }

  SayHelloResponse._();

  factory SayHelloResponse.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory SayHelloResponse.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'SayHelloResponse',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'greeter.v1'),
      createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'message')
    ..aInt64(2, _omitFieldNames ? '' : 'servedAtUnixMs')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  SayHelloResponse clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  SayHelloResponse copyWith(void Function(SayHelloResponse) updates) =>
      super.copyWith((message) => updates(message as SayHelloResponse))
          as SayHelloResponse;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static SayHelloResponse create() => SayHelloResponse._();
  @$core.override
  SayHelloResponse createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static SayHelloResponse getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<SayHelloResponse>(create);
  static SayHelloResponse? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get message => $_getSZ(0);
  @$pb.TagNumber(1)
  set message($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasMessage() => $_has(0);
  @$pb.TagNumber(1)
  void clearMessage() => $_clearField(1);

  /// Contoh field non-string (epoch milidetik) untuk membuktikan tipe ikut lintas-bahasa.
  @$pb.TagNumber(2)
  $fixnum.Int64 get servedAtUnixMs => $_getI64(1);
  @$pb.TagNumber(2)
  set servedAtUnixMs($fixnum.Int64 value) => $_setInt64(1, value);
  @$pb.TagNumber(2)
  $core.bool hasServedAtUnixMs() => $_has(1);
  @$pb.TagNumber(2)
  void clearServedAtUnixMs() => $_clearField(2);
}

class StreamTicksRequest extends $pb.GeneratedMessage {
  factory StreamTicksRequest({
    $core.int? count,
  }) {
    final result = create();
    if (count != null) result.count = count;
    return result;
  }

  StreamTicksRequest._();

  factory StreamTicksRequest.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory StreamTicksRequest.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'StreamTicksRequest',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'greeter.v1'),
      createEmptyInstance: create)
    ..aI(1, _omitFieldNames ? '' : 'count')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  StreamTicksRequest clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  StreamTicksRequest copyWith(void Function(StreamTicksRequest) updates) =>
      super.copyWith((message) => updates(message as StreamTicksRequest))
          as StreamTicksRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static StreamTicksRequest create() => StreamTicksRequest._();
  @$core.override
  StreamTicksRequest createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static StreamTicksRequest getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<StreamTicksRequest>(create);
  static StreamTicksRequest? _defaultInstance;

  @$pb.TagNumber(1)
  $core.int get count => $_getIZ(0);
  @$pb.TagNumber(1)
  set count($core.int value) => $_setSignedInt32(0, value);
  @$pb.TagNumber(1)
  $core.bool hasCount() => $_has(0);
  @$pb.TagNumber(1)
  void clearCount() => $_clearField(1);
}

class TickMessage extends $pb.GeneratedMessage {
  factory TickMessage({
    $core.int? index,
    $fixnum.Int64? atUnixMs,
  }) {
    final result = create();
    if (index != null) result.index = index;
    if (atUnixMs != null) result.atUnixMs = atUnixMs;
    return result;
  }

  TickMessage._();

  factory TickMessage.fromBuffer($core.List<$core.int> data,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromBuffer(data, registry);
  factory TickMessage.fromJson($core.String json,
          [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) =>
      create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(
      _omitMessageNames ? '' : 'TickMessage',
      package: const $pb.PackageName(_omitMessageNames ? '' : 'greeter.v1'),
      createEmptyInstance: create)
    ..aI(1, _omitFieldNames ? '' : 'index')
    ..aInt64(2, _omitFieldNames ? '' : 'atUnixMs')
    ..hasRequiredFields = false;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TickMessage clone() => deepCopy();
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TickMessage copyWith(void Function(TickMessage) updates) =>
      super.copyWith((message) => updates(message as TickMessage))
          as TickMessage;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static TickMessage create() => TickMessage._();
  @$core.override
  TickMessage createEmptyInstance() => create();
  @$core.pragma('dart2js:noInline')
  static TickMessage getDefault() => _defaultInstance ??=
      $pb.GeneratedMessage.$_defaultFor<TickMessage>(create);
  static TickMessage? _defaultInstance;

  @$pb.TagNumber(1)
  $core.int get index => $_getIZ(0);
  @$pb.TagNumber(1)
  set index($core.int value) => $_setSignedInt32(0, value);
  @$pb.TagNumber(1)
  $core.bool hasIndex() => $_has(0);
  @$pb.TagNumber(1)
  void clearIndex() => $_clearField(1);

  @$pb.TagNumber(2)
  $fixnum.Int64 get atUnixMs => $_getI64(1);
  @$pb.TagNumber(2)
  set atUnixMs($fixnum.Int64 value) => $_setInt64(1, value);
  @$pb.TagNumber(2)
  $core.bool hasAtUnixMs() => $_has(1);
  @$pb.TagNumber(2)
  void clearAtUnixMs() => $_clearField(2);
}

const $core.bool _omitFieldNames =
    $core.bool.fromEnvironment('protobuf.omit_field_names');
const $core.bool _omitMessageNames =
    $core.bool.fromEnvironment('protobuf.omit_message_names');
