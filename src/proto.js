export default `// LFC Block

message LFCOutput {
  required uint64 index = 1;
  required uint64 amount = 2;
  required string address = 3;
}

message LFCInput {
  required uint64 index = 1;
  required string tx = 2;  
  required uint64 amount = 3;
  required string address = 4;
  required string signature = 5;
}


message LFCTransaction {
  required string id = 1;
  required uint64 time = 2;
  required string hash = 3;
  optional string reward = 4;
  repeated LFCInput inputs = 5;
  repeated LFCOutput outputs = 6;
}

message LFCBlock {
  required uint64 index = 1;
  required string prevHash = 2;
  required uint64 time = 3;
  required uint64 nonce = 4;
  repeated LFCTransaction transactions = 5;
}`