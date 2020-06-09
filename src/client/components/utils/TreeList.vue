<template>
    <div class="col-12" :class="{ 'col-lg-6': includeSelf }">
        <!-- <div class="form-check" v-if="this.data.showSelf !== false">
            <input :id="data.id" ref="checkbox" v-model="checked" type="checkbox" :disabled="disabled === true" class="form-check-input" />
            <label :for="data.id">{{ this.data.text }}</label>
        </div>
        <div class="tree row" :class="{ 'ml-4': this.data.showSelf !== false }" v-if="children.length > 0">
            <tree v-for="child in children" :key="child.id" :disabled="disabled === true" :data="child" />
        </div> -->
    </div>
</template>

<script lang="ts">
    // import Vue from 'vue';
    // import { ErrorPacket } from '../../../common/network/ServerPackets';
    // import Role from '../../../common/models/Role';
    // import TreeItem from '../../../common/utils/TreeItem'
    // import Tag, { Type } from '../../../common/models/Tag';

    // var isUpdating = false;
    // export default Vue.extend({
    //     name: 'tree',
    //     props: [ "data", "disabled" ],
    //     data: function() { 
    //         return {
    //             checked: false
    //         }
    //     },
    //     beforeUpdate: function() {
    //         this.delegateDown(null);
    //     },
    //     methods: {
    //         checkDown(checked: boolean) {
    //             this.checked = checked;
    //             this.$children.forEach(child => {
    //                 if (child.$options.name !== 'tree') return;

    //                 (child as any).checkDown(checked);
    //             });
    //         },
    //         notifyUp() {
    //             if (isUpdating) return;

    //             if (this.isRoot) {
    //                 isUpdating = true;
    //                 try {
    //                     this.delegateDown();
    //                 } finally {
    //                     isUpdating = false;
    //                 }
    //             } else {
    //                 (this.$parent as any).notifyUp();
    //             }
    //         },

    //         // 0 for none, 1 for some, 2 for all, 3 for ignore
    //         delegateDown(ids: string[] = null): number {
    //             // If the list of ids contains us we want to check ourselves
    //             if (ids !== null && this.includeSelf) {
    //                 this.checked = ids.indexOf(this.data.id) > 0;
    //             }

    //             // If we don't contain any children, we want to return immediately
    //             // If we are checked we return 2, otherwise 0
    //             if (this.$children.length == 0) {
    //                 if (this.includeSelf) {
    //                     return this.checked ? 2 : 0;
    //                 } else {
    //                     return 3;
    //                 }
    //             }

    //             var allChecked = true;
    //             var noneChecked = true;

    //             // We loop over all children
    //             this.$children.forEach(child => {
    //                 // If the child element is not a tree element we ignore it
    //                 // shouldn't really happen though
    //                 if (child.$options.name !== 'tree') return;
    //                 try {
    //                     // We call the children recursively
    //                     switch ((child as any).delegateDown()) {
    //                         // If the child doesn't have any checked we set allChecked to false
    //                         case 0:
    //                             allChecked = false;
    //                             break;
    //                         // If the child has some checked we set allChecked and noneChecked on false
    //                         case 1:
    //                             allChecked = false;
    //                             noneChecked = false;
    //                             break;
    //                             // If the child has all checked, we set noneChecked on false
    //                         case 2:
    //                             noneChecked = false;
    //                             break;
    //                     }
    //                 } catch(e) {}
    //             });

    //             // If we include ourselves and it is currently checked we set noneChecked on false
    //             // and otherwise allChecked on false
    //             if (this.includeSelf) {
    //                 if (this.checked) {
    //                     noneChecked = false;
    //                 } else {
    //                     allChecked = false;
    //                 }
    //             }

    //             // We check if we can find our checkbox (if showSelf is false we don't have it available for example)
    //             let checkbox = this.$refs.checkbox as any;
    //             if (checkbox != null) {
    //                 // We set it preemptively on
    //                 checkbox.indeterminate = false;
    //                 if (allChecked) {
    //                     this.checked = true;
    //                 } else if (noneChecked) {
    //                     this.checked = false
    //                 } else {
    //                     this.checked = false;
    //                     checkbox.indeterminate = true;
    //                 }
    //             }
                
    //             return allChecked ? 2 : (noneChecked ? 0 : 1);
    //         }
    //     },
    //     computed: {
    //         isRoot: function(): boolean {
    //             return this.$parent.$options.name !== 'tree';
    //         },
    //         children: function(): TreeItem[] {
    //             return this.data.children || [];
    //         },
    //         includeSelf: function(): boolean {
    //             if (this.data.includeSelf === false) return false;
    //             return true;
    //         }
    //     }
    // });
</script>

<style scoped>
</style>