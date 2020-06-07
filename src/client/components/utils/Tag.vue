<template>
    
    <span class="user-badge badge" :class="tagClass" data-toggle="tooltip" :data-placement="side" :title="title">
        {{ text }}
        <span></span>
    </span>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { ErrorPacket } from '../../../common/network/ServerPackets';
    import Role from '../../../common/models/Role';
    import Tag, { Type } from '../../../common/models/Tag';

    export default Vue.extend({
        name: 'username',
        props: [ "tag", "tagSide" ],
        computed: {
            side: function(): string {
                return this.tagSide || "bottom";
            },
            title: function(): string {
                return this.tag.text;
            },
            text: function(): string {
                return this.tag.text.substring(0, 1);
            },
            tagClass: function(): string {
                return 'badge-'+getTag(this.tag.type);
            }
        },
        
        mounted: function() {
            $(this.$el).tooltip({
                container: this.$el.children[0]
            });
        },
        beforeDestroy: function() {
            $(this.$el).tooltip('dispose');
        }
    });
    
    function getTag(type: Type): string {
        switch (type) {
            case Type.Primary:
                return 'primary';
            case Type.Secondary:
                return 'secondary';
            case Type.Success:
                return 'success';
            case Type.Danger:
                return 'danger';
            case Type.Warning:
                return 'warning';
            case Type.Info:
                return 'info';
            case Type.Dark:
                return 'dark';
        }

        return 'light';
    }
</script>

<style scoped>
    .user-badge {
        font-size: 5pt;
        vertical-align: top;
        cursor: default;
    }
</style>