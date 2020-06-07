import Tag from "./Tag";

export default interface User {
    id: string;
    username: string;
    hash: string;
    tags?: Tag[]
}