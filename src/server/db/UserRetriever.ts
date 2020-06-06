import { Db } from "mongodb";
import Role from "../../common/models/Role";
import ClientError from "../util/ClientError";
import crypto from 'crypto';

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
                case Role.WebMaster:
                    role = Role.WebMaster;
                    break;
                case Role.Administrator:
                    role = Role.Administrator;
                    break;
                case Role.Moderator:
                    role = Role.Moderator;
                    break;
            }
        }

        return {
            hash: hash,
            role: role
        }
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
}