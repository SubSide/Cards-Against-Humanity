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
    import Tag, { TagType } from '../../../common/models/Tag';
    import { TagTypes } from '../../utils/TagTypeUtils';

    export default Vue.extend({
        name: 'tag',
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
                return 'badge-'+TagTypes.get(this.tag.type);
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
</script>

<style scoped>
    .user-badge {
        font-size: 5pt;
        vertical-align: top;
        cursor: default;
    }
</style>