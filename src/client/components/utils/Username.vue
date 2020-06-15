<template>
    <span>
        <span v-bind:title="hash" ref="diz" v-on:dblclick="openUserManagement">{{ username }}</span><tag 
            v-for="tag in tags" :tag="tag" :tagSide="tagSide" :key="tag.text"/>
    </span>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { ErrorPacket } from '../../../common/network/ServerPackets';
    import Role from '../../../common/models/Role';
    import Tag from '../../../common/models/Tag';
    import TagVue from './Tag.vue';
    import { RequestUserManagementPacket } from '../../../common/network/ClientPackets';

    export default Vue.extend({
        name: 'username',
        props: [ "user", "tagSide" ],
        computed: {
            username: function(): string {
                return (this.user as any).username;
            },
            hash: function(): string {
                return (this.user as any).hash;
            },
            tags: function(): Tag[] {
                return (this.user as any).tags;
            },
            canOpenManagement: function(): boolean {
                return this.$store.state.role >= Role.Moderator;
            }
        },
        methods: {
            openUserManagement() {
                if (this.canOpenManagement) {
                    this.$socket.send(new RequestUserManagementPacket(this.user.id));
                }
            },
            getTagClasses(tag: Tag): string {
                return 'user-badge badge badge-'+tag.type;
            }
        },
        components: {
            'tag': TagVue
        }
    });
</script>

<style scoped>
    .user-badge {
        font-size: 5pt;
        vertical-align: top;
        cursor: default;
    }
</style>