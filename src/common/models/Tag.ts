export default interface Tag {
    text: string,
    type: Type
}

export enum Type {
    Primary = 0,
    Secondary = 1,
    Success = 2,
    Danger = 3,
    Warning = 4,
    Info = 5,
    Light = 6,
    Dark = 7,
}