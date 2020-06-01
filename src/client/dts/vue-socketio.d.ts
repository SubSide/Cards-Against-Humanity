declare module 'vue-socket.io' {
    import { PluginObject } from "vue";
    export interface Config {
        debug: boolean;
        vuex: any;
        connection: string;
    }

    export class VueSocketIO implements PluginObject<Config> {
        constructor(config: Config);
        install(): any
    }

    export default VueSocketIO;
}