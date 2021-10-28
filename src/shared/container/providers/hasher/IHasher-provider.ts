export interface IHasherProvider {
  hash(plaintext: string): Promise<string>;
  compare(plaintext: string, digest: string): Promise<boolean>;
}
