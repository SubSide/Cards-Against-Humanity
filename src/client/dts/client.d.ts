import Vue, { ComponentOptions } from "vue";
import socketIO from 'socket.io-client';

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        sockets?: { [key: string]: (this: V, ...args: any[]) => any };
    }
}

declare module "vue/types/vue" {
    interface Vue {
        $socket: typeof socketIO.Socket;
    }
}

