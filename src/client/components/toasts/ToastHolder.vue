<template>
    <div>
        <div class="toast-holder p-2" style="position: fixed; bottom: 0; right: 0;"></div>
        <div class="toast-template d-none">
            <div class="toast" role="alert" data-delay="10000" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        class="rounded mr-2" 
                        width="20" height="20" 
                        preserveAspectRatio="xMidYMid slice" focusable="false" role="img">
                        <rect class="toast-icon" fill="#FF0000" width="100%" height="100%"></rect>
                    </svg>
                    <strong class="toast-title mr-auto">Title</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="toast-body">Body</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { ErrorPacket, InfoPacket } from '../../../common/network/ServerPackets';

    export default Vue.extend({
        name: 'toast-holder',
        sockets: {
            errorPacket: function(data: ErrorPacket) {
                console.error(data.error);
                (this as any).createToast("Error", data.error, "#FF0000");
            },
            infoPacket: function(data: InfoPacket) {
                console.info(data.info);
                (this as any).createToast("Info", data.info, "#7777FF");
            }
        },
        methods: {
            createToast: function(
                title: string, 
                content: string, 
                color: string = "#004488", 
                delay: number = 15000
            ) {
                // Create a toast from template
                let template = this.$el.querySelector(".toast-template").firstChild.cloneNode(true);
                let qTemplate = $(template);
                qTemplate.find(".toast-title").text(title);
                qTemplate.find(".toast-body").text(content);
                qTemplate.find(".toast-icon").attr('fill', color);
                this.$el.querySelector('.toast-holder').appendChild(template);
                qTemplate.toast({
                    delay: delay,
                    autohide: true
                });
                qTemplate.toast('show');
                qTemplate.on('hidden.bs.toast', function() {
                    qTemplate.toast('dispose');
                    qTemplate.remove();
                });
            }
        }
    });
</script>

<style scoped>
    .toast-holder {
        z-index: 9999;
    }
</style>