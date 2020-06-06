import Role from "./Role";

export interface User {
    username: string;
    hash: string;
    role: Role;
}