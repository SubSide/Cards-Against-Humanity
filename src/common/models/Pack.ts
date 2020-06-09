export default interface Pack {
    id: string,
    name: string,
}

export interface PackGroup {
    title: string,
    packs: Pack[]
}