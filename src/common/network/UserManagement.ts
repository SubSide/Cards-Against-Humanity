import { TagType } from "../models/Tag";
import Role from "../models/Role";

export type UserManagement = 
    ManUserKickOutRoom |
    ManUserDisconnect |
    ManUserBan |
    ManUserSetRole |
    ManUserTagManagement
;

interface UserManagementPayload {
    type: string;
}

export class ManUserKickOutRoom implements UserManagementPayload {
    type: 'manUserKickOutRoom' = 'manUserKickOutRoom';
}

export class ManUserDisconnect implements UserManagementPayload {
    type: 'manUserDisconnect' = 'manUserDisconnect';
}

export class ManUserBan implements UserManagementPayload {
    type: 'manUserBan' = 'manUserBan';
}

export class ManUserSetRole implements UserManagementPayload {
    type: 'manUserSetRole' = 'manUserSetRole';
    constructor(public role: Role) {}
}


export class ManUserTagManagement implements UserManagementPayload {
    type: 'manUserTags' = 'manUserTags';
    constructor(public payload: UserTagManagement) {}
}

export type UserTagManagement = TagManagementAdd | TagManagementRemove;

interface TagManagement {
    type: string;
}

export class TagManagementAdd implements TagManagement {
    type: 'add' = 'add';
    constructor(
        public tagType: TagType, 
        public text: string
    ) {}
}

export class TagManagementRemove implements TagManagement {
    type: 'remove' = 'remove';
    constructor(
        public text: string
    ) {}
}