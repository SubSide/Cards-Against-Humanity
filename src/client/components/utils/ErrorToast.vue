<template>
    <div class="toast" id="errorToast" role="alert" data-delay="5000000" aria-live="assertive" aria-atomic="true" style="position: fixed; bottom: 20px; right: 20px; min-width: 250px;">
        <div class="toast-header">
            <svg xmlns="http://www.w3.org/2000/svg" 
                class="rounded mr-2" 
                width="20" height="20" 
                preserveAspectRatio="xMidYMid slice" focusable="false" role="img">
                <rect fill="#FF0000" width="100%" height="100%"></rect>
            </svg>
            <strong class="mr-auto">Error</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body">{{ error }}</div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { ErrorPacket } from '../../../common/network/ServerPackets';

    export default Vue.extend({
        name: 'error-toast',
        data: function() {
            return {
                error: ""
            }
        },
        sockets: {
            errorPacket: function(data: ErrorPacket) {
                this.$data.error = data.error;
                console.error(data.error);
                $("#errorToast").toast('show');
            }
        }
    });
</script>