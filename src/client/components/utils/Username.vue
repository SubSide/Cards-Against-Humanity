<template>
    <span data-toggle="tooltip" data-placement="top" v-bind:title="tooltipText">{{ prefix }}{{ username }}</span>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { ErrorPacket } from '../../../common/network/ServerPackets';
    import Role from '../../../common/models/Role';

    export default Vue.extend({
        name: 'username',
        props: [ "user" ],
        computed: {
            username: function() {
                return (this.user as any).username;
            },
            hash: function() {
                return (this.user as any).hash;
            },
            role: function() {
                return (this.user as any).role;
            },
            tooltipText: function() {
                var toolTip = (this as any).hash;
                let roleText = this.roleText;
                if (roleText != "") {
                    toolTip += " (" + roleText + ")";
                }

                return toolTip;
            },
            roleText: function() {
                switch (this.role) {
                    case Role.Moderator: return "Moderator";
                    case Role.Administrator: return "Administrator";
                    case Role.WebMaster: return "Administrator";
                }
                return "";
            },
            prefix: function() {
                if (this.hash == null || this.hash == "")
                    return "";
                
                switch (this.role) {
                    case Role.Moderator: return "+";
                    case Role.Administrator: return "#";
                    case Role.WebMaster: return "@";
                }
                
                return "-";
            }
        }
    });
</script>