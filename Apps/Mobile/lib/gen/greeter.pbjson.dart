// This is a generated file - do not edit.
//
// Generated from greeter.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_relative_imports
// ignore_for_file: unused_import

import 'dart:convert' as $convert;
import 'dart:core' as $core;
import 'dart:typed_data' as $typed_data;

@$core.Deprecated('Use sayHelloRequestDescriptor instead')
const SayHelloRequest$json = {
  '1': 'SayHelloRequest',
  '2': [
    {'1': 'name', '3': 1, '4': 1, '5': 9, '10': 'name'},
  ],
};

/// Descriptor for `SayHelloRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List sayHelloRequestDescriptor = $convert
    .base64Decode('Cg9TYXlIZWxsb1JlcXVlc3QSEgoEbmFtZRgBIAEoCVIEbmFtZQ==');

@$core.Deprecated('Use sayHelloResponseDescriptor instead')
const SayHelloResponse$json = {
  '1': 'SayHelloResponse',
  '2': [
    {'1': 'message', '3': 1, '4': 1, '5': 9, '10': 'message'},
    {'1': 'served_at_unix_ms', '3': 2, '4': 1, '5': 3, '10': 'servedAtUnixMs'},
  ],
};

/// Descriptor for `SayHelloResponse`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List sayHelloResponseDescriptor = $convert.base64Decode(
    'ChBTYXlIZWxsb1Jlc3BvbnNlEhgKB21lc3NhZ2UYASABKAlSB21lc3NhZ2USKQoRc2VydmVkX2'
    'F0X3VuaXhfbXMYAiABKANSDnNlcnZlZEF0VW5peE1z');

@$core.Deprecated('Use streamTicksRequestDescriptor instead')
const StreamTicksRequest$json = {
  '1': 'StreamTicksRequest',
  '2': [
    {'1': 'count', '3': 1, '4': 1, '5': 5, '10': 'count'},
  ],
};

/// Descriptor for `StreamTicksRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List streamTicksRequestDescriptor = $convert
    .base64Decode('ChJTdHJlYW1UaWNrc1JlcXVlc3QSFAoFY291bnQYASABKAVSBWNvdW50');

@$core.Deprecated('Use tickMessageDescriptor instead')
const TickMessage$json = {
  '1': 'TickMessage',
  '2': [
    {'1': 'index', '3': 1, '4': 1, '5': 5, '10': 'index'},
    {'1': 'at_unix_ms', '3': 2, '4': 1, '5': 3, '10': 'atUnixMs'},
  ],
};

/// Descriptor for `TickMessage`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List tickMessageDescriptor = $convert.base64Decode(
    'CgtUaWNrTWVzc2FnZRIUCgVpbmRleBgBIAEoBVIFaW5kZXgSHAoKYXRfdW5peF9tcxgCIAEoA1'
    'IIYXRVbml4TXM=');
