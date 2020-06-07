import Pack from './Pack';

export default interface PackGroup {
    name: string;
    orderNumber: number;
    packs: Pack[];
}