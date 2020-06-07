export default interface Tag {
    text: string,
    type: Type
}

export enum Type {
    Primary = 0,
    Secondary,
    Success,
    Danger,
    Warning,
    Info,
    Light,
    Dark,
}