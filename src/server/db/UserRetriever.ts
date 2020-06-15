import { Db } from "mongodb";
import Role from "../../common/models/Role";
import crypto from 'crypto';
import Tag from "../../common/models/Tag";
import ServerUser from "../models/ServerUser";

export default class UserRetriever {
    constructor(private db: Db) {}

    async getHashInfo(username: string, password: string): Promise<HashInfo> {
        let hash = this.createHash(username, password);
        let hashObj = await this.db.collection("hashes").findOne({
            username: username,
            hash: hash
        });

        let role = Role.Default;

        if (hashObj && "role" in hashObj) {
            switch (hashObj["role"]) {
                case Role.Administrator:
                    role = Role.Administrator;
                    break;
                case Role.Staff:
                    role = Role.Staff;
                    break;
                case Role.Moderator:
                    role = Role.Moderator;
                    break;
            }
        }

        var tags: Tag[] = [];
        if (hashObj != null && 'tags' in hashObj && Array.isArray(hashObj["tags"])) {
            tags = hashObj["tags"];
        }

        return {
            hash: hash,
            role: role,
            tags: tags
        }
    }

    async addTag(user: ServerUser, tag: Tag) {
        await this.db.collection("hashes").updateOne(
            { username: user.username, hash: user.hash },
            {
                $setOnInsert: {
                    username: user.username,
                    hash: user.hash,
                    role: Role.Default
                },
                $push: {
                    tags: tag
                }
            },
            { upsert: true }
        )
    }

    async removeTag(user: ServerUser, tagText: string) {
        await this.db.collection("hashes").updateOne(
            { username: user.username, hash: user.hash },
            {
                $pull: {
                    tags: {
                        text: tagText
                    }
                }
            }
        )

        await this.removeUnneededHashes();
    }

    async setRole(user: ServerUser, role: Role) {
        await this.db.collection("hashes").updateOne(
            { username: user.username, hash: user.hash },
            {
                $setOnInsert: {
                    username: user.username,
                    hash: user.hash,
                    tags: []
                },
                $set: {
                    role: role
                }
            },
            { upsert: true }
        )

        await this.removeUnneededHashes();
    }

    async removeUnneededHashes() {
        await this.db.collection("hashes").deleteMany(
            {
                role: Role.Default,
                tags: []
            }
        )
    }
    
    /**
     * Creates a hash based on the username and password
     * @param username
     * @param password 
     * @returns the created hash
     */
    private createHash(username: string, password: string): string {
        return crypto.createHmac("sha1", process.env.SERVER_SECRET)
            .update(username)
            .update(password)
            .update("Hi mom!")
            .digest("base64")
            .replace('=', '')
    }
}

interface HashInfo {
    hash: string;
    role: Role;
    tags: Tag[];
}