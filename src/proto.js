export default `// LFC Block

message LFCTransactionLink {
  required string multihash = 1;
  required uint64 size = 2;
}

message LFCBlock {
  required uint64 index = 1;
  required string prevHash = 2;
  required uint64 time = 3;
  required uint64 nonce = 4;
  repeated LFCTransactionLink transactions = 5;
}`