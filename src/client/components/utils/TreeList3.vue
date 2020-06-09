<template>
    <div class="col-12" :class="{ 'col-lg-6': includeSelf }">
        <!-- <div class="form-check" v-if="showSelf">
            <input :id="data.id" v-model="checked" @click="click" type="checkbox" :disabled="isDisabled" class="form-check-input" />
            <label :for="data.id">{{ text }}</label>
        </div>
        <div class="tree row" :class="{ 'ml-4': showSelf }" v-if="children.length > 0">
            <tree v-for="child in children" :key="child.id" :disabled="isDisabled" :data="child" />
        </div> -->
    </div>
</template>

<script lang="ts">
    // import Vue from 'vue';
    // import { ErrorPacket } from '../../../common/network/ServerPackets';
    // import Role from '../../../common/models/Role';
    // import TreeItem from '../../../common/utils/TreeItem'
    // import Tag, { Type } from '../../../common/models/Tag';

    // export default Vue.extend({
    //     name: 'tree',
    //     props: [ "data", "disabled" ],
    //     data: function() { 
    //         return {
    //             checked: false,
    //             doUpdate: false
    //         }
    //     },
    //     watch: {
    //         checked: function() {
    //             if (!this.$data.doUpdate)
    //                 return;
    //             this.$data.doUpdate = false;
    //             this.setIndeterminate(false);
    //             this.$children.forEach(item => {
    //                 item.$data.checked = this.$data.checked;
    //             });
                
    //             this.delegateUpwards();
    //         }
    //     },
    //     updated: function() {

    //     },
    //     methods: {
    //         click: function() {
    //             this.$data.doUpdate = true
    //         },
    //         updateTreeState: function() {
    //             this.checkForChildren();
    //             this.delegateUpwards();
    //         },
    //         delegateUpwards: function() {
    //             try {
    //                 (this.$parent as any).updateTreeState();
    //             } catch(e){}
    //         },
    //         checkForChildren: function() {
    //             if (this.$children.length == 0) return;
    //             let checked = $(this.$el).find("> .tree").find("input:not(:checked)").length == 0;
    //             let indeterm = $(this.$el).find("> .tree").find("input:checked").length > 0;
                
    //             this.setIndeterminate(!checked && indeterm);
    //             this.checked = checked;
    //         },
    //         setIndeterminate: function(bool: boolean) {
    //             if (!this.showSelf) return;
    //             if (bool)
    //                 this.checked = false;
    //             (this.$el.querySelector(".form-check > input") as any).indeterminate = bool;
    //         },
    //         getSelected: function(): TreeItem[] {
    //             var selected: TreeItem[] = [];

    //             if (this.includeSelf && this.$data.checked)
    //                 selected.push(this.data as TreeItem);
                
    //             this.$children.forEach(child => {
    //                 try {
    //                     selected = selected.concat((child as any).getSelected());
    //                 } catch(e) {}
    //             })

    //             return selected;
    //         },

    //         doExternalUpdate(ids: string[]) {
    //             this.checked = (ids.indexOf(this.data.id) >= 0) ? true : false;
    //             console.debug(this.checked, " ", ids);

    //             this.$children.forEach(child => {
    //                 try {
    //                     (child as any).doExternalUpdate(ids);
    //                 } catch(e) {}
    //             });
    //             this.checkForChildren();
    //         }
    //     },
    //     computed: {
    //         isDisabled: function() {
    //             return this.disabled === true;
    //         },
    //         text: function(): string {
    //             return this.data.text;
    //         },
    //         children: function(): TreeItem[] {
    //             return this.data.children || [];
    //         },
    //         includeSelf: function(): boolean {
    //             if (this.data.includeSelf === false) return false;
    //             return true;
    //         },
    //         showSelf: function(): boolean {
    //             if (this.data.showSelf === false) return false;
    //             return true;
    //         }
    //     }
    // });
    // // id: string,
    // // text: string,
    // // includeSelf?: boolean,
    // // showSelf?: boolean,
    // // children?: TreeItem[]
</script>

<style scoped>
</style>