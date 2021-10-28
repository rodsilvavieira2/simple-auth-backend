export interface IUuidProvider {
    create(): Promise<string>
}
