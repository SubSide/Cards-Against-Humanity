
<template>
    <div class="modal fade" id="userManagementDialog" tabindex="-1" role="dialog" aria-labelledby="userManagementLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="userManagementLabel">User management for {{ user != null ? user.username : "" }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" v-if="user != null">
                    <p class="col-12">
                        User: <username :user="user" /><br />
                        Role: 
                        <select class="form-control" v-model="role" :disabled="!isUnique || !canDoAction">
                            <option v-for="role in roles" :key="role" :value="role" :disabled="role >= selfRole">{{ getRoleText(role) }}</option>
                        </select>
                        
                        <br />
                    </p>
                    <div class="col-12">
                        Tags:
                        <span>
                            <span v-for="tag in user.tags" :key="tag.text" class="badge badge-lg ml-2" :class="badgeClass(tag)">
                                {{ tag.text }}
                                <span v-if="canDoAction" class="p-1 clickable" @click="deleteTag(tag)">X</span>
                            </span>
                            <span v-if="user.tags == null || user.tags.length == 0">
                                None
                            </span>
                        </span>
                        <div class="mt-3" v-if="canDoAction && isUnique">
                            <h5>Add new tag:</h5>
                            <div class="form-group">
                                <label for="tagText">Text</label>
                                <input type="text" class="form-control" id="tagText" v-model="tagText" placeholder="Enter tag text" pattern="[a-zA-Z0-9]{2,24}">
                            </div>
                            <div class="form-group">
                                <label for="tagType">Tag color:</label>
                                <select class="form-control" id="tagType" v-model="tagType" :disabled="!isUnique || !canDoAction">
                                    <option v-for="tagType in tagTypes" :key="tagType[0]" :value="tagType[0]" :class="'text-'+ tagType[1]">{{ tagType[1] }}</option>
                                </select>
                            </div>
                            <button class="btn btn-success" @click="addTag">Add tag</button>
                        </div>
                    </div>
                    <div class="col-12 mt-5">
                        <button class="btn btn-warning m-1" @click="kick" :disabled="player == null || !canDoAction">Kick from Room</button>
                        <button class="btn btn-danger m-1" @click="disconnect" :disabled="!canDoAction">Disconnect</button>
                        <button class="btn btn-light m-1"  @click="ban" :disabled="!canDoAction || true">Ban from game</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button class="btn btn-primary">Update</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { ErrorPacket, UserManagementPacket } from '../../../common/network/ServerPackets';
    import Role from '../../../common/models/Role';
    import Tag, { TagType } from '../../../common/models/Tag';
    import TagVue from './Tag.vue';
    import User from '../../../common/models/User';
    import { ManUserKickOutRoom, ManUserDisconnect, ManUserSetRole, UserManagement, ManUserTagManagement, TagManagementAdd, TagManagementRemove } from '../../../common/network/UserManagement';
    import { DoUserManagementPacket } from '../../../common/network/ClientPackets';
    import { TagTypes } from '../../utils/TagTypeUtils';

    export default Vue.extend({
        name: 'user-management',
        data() {
            return {
                user: null,
                role: null,
                previousRole: null,
                player: null,
                tagText: "",
                tagType: TagType.Primary
            }
        },
        watch: {
            role: function() {
                if (this.previousRole == this.role) return;
                this.previousRole = this.role;
                this.sendManagementPacket(new ManUserSetRole(this.role));
            }
        },
        computed: {
            roleText: function(): string {
                return this.getRoleText(this.role);
            },
            self: function(): User {
                return this.$store.state.user;
            },
            selfRole: function(): Role {
                return this.$store.state.role;
            },
            canDoAction: function(): boolean {
                return this.selfRole > this.role;
            },
            isUnique: function(): boolean {
                if (this.user == null) return false;
                return this.user.hash != null;
            },
            roles: function(): Role[] {
                return [Role.Default, Role.Moderator, Role.Staff, Role.Administrator];
            },
            tagTypes: function(): Map<number, string> {
                return TagTypes;
            }
        },
        sockets: {
            userManagement: function(data: UserManagementPacket) {
                this.$data.user = data.user;
                this.$data.role = data.role;
                this.$data.previousRole = data.role;
                this.$data.player = data.player;
                $("#userManagementDialog").modal('show');
            }
        },
        methods: {
            sendManagementPacket(payload: UserManagement) {
                this.$socket.send(new DoUserManagementPacket(
                    this.user.id,
                    payload
                ));
            },
            kick() {
                this.sendManagementPacket(new ManUserKickOutRoom());
            },
            disconnect() {
                this.sendManagementPacket(new ManUserDisconnect());
            },
            ban() {
                // TODO
            },
            addTag() {
                this.sendManagementPacket(new ManUserTagManagement(
                    new TagManagementAdd(this.tagType, this.tagText)
                ));
                this.tagType = TagType.Primary;
                this.tagText = "";
            },
            deleteTag(tag: Tag) {
                this.sendManagementPacket(new ManUserTagManagement(
                    new TagManagementRemove(tag.text)
                ));
            },
            badgeClass(tag: Tag): string {
                return 'badge-'+TagTypes.get(tag.type)
            },
            getRoleText(role: Role): string {
                switch (role) {
                    case Role.Moderator: return "Moderator"; break;
                    case Role.Staff: return "Staff"; break;
                    case Role.Administrator: return "Administrator"; break;
                    default: return "User";
                }
            }
        }
    });
</script>

<style scoped>
    .clickable {
        cursor: pointer;
    }
</style>