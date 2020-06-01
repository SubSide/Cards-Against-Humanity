declare module 'sessionstorage' {
    interface SStorage {
        getItem(key: string): string;
        setItem(key: string, value: string): void
    }
    export default SStorage;
}