// eslint-disable-next-line @typescript-eslint/no-explicit-any
type gofunc = (...any) => any;
export interface GoFuncs {
  generateX25519Identity: () => { publicKey: string; privateKey: string };
  encrypt: (recipients: string, input: string) => { output: string };
  encryptBinary: (recipients: string, input: Uint8Array) => Uint8Array;
  decrypt: (identities: string, input: string) => { output: string };
  decryptBinary: (identities: string, input: Uint8Array) => Uint8Array;
  mnemonic: (recipient1: string, recipient2: string) => { output: string };
}
