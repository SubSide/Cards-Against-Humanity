<template>
    <div class="col-12" :class="{ 'col-lg-6': includeSelf }">
        <div class="form-check" v-if="showSelf">
            <input :id="data.id" v-model="$data._checked" @click="clicked" type="checkbox" class="form-check-input" />
            <label :for="data.id">{{ text }}</label>
        </div>
        <div class="tree row" :class="{ 'ml-4': showSelf }" v-if="children.length > 0">
            <tree v-for="child in children" :key="child.id" :data="child" />
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { ErrorPacket } from '../../../common/network/ServerPackets';
    import Role from '../../../common/models/Role';
    import TreeItem from '../../../common/utils/TreeItem'
    import Tag, { Type } from '../../../common/models/Tag';

    export default Vue.extend({
        name: 'tree',
        props: [ "data" ],
        data: function() { 
            return {
                _checked: false
            }
        },
        methods: {
            updateState: function() {
                let found = false;
                let checked = $(this.$el).find("> .tree").find("input:not(:checked)").length == 0;
                let indeterm = $(this.$el).find("> .tree").find("input:checked").length > 0;
                if (checked) {
                    this.setIndeterminate(false);
                    this.$data._checked = true;
                } else if(indeterm) {
                    this.setIndeterminate(true);
                    this.$data._checked = false;
                } else {
                    this.setIndeterminate(false);
                    this.$data._checked = false;
                }
            },
            delegateUpwards: function() {
                try {
                    (this.$parent as any).updateState();
                } catch(e){}
            },
            setIndeterminate: function(bool: boolean) {
                if (!this.showSelf) return;
                this._checked = false;
                (this.$el.querySelector(".form-check > input") as any).indeterminate = bool;
            },
            setSelf: function(bool: boolean) {
                this._checked = false;
            },
            clicked: function() {
                this.checked = this.$data._checked;
                $(this.$el).find("> .tree").find("input").prop('checked', !this.checked);
            }
        },
        computed: {
            text: function(): string {
                return this.data.text;
            },
            children: function(): TreeItem[] {
                return this.data.children || [];
            },
            includeSelf: function(): boolean {
                if (this.data.includeSelf === false) return false;
                return true;
            },
            showSelf: function(): boolean {
                if (this.data.showSelf === false) return false;
                return true;
            },
            checked: {
                get(): boolean {
                    return this.$data._checked;
                },
                set(value: boolean) {
                    this.$data._checked = value;
                    this.setIndeterminate(false);
                    this.delegateUpwards();
                }
            }
        }
    });
    // id: string,
    // text: string,
    // includeSelf?: boolean,
    // showSelf?: boolean,
    // children?: TreeItem[]
</script>

<style scoped>
</style>