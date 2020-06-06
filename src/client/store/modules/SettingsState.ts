import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import Cookie from 'js-cookie';

@Module
export default class SettingsState extends VuexModule {
    cardSize: number = parseInt(Cookie.get("settings.cardSize"));

    @Mutation
    updateCardSize(cardSize: number) {
        this.cardSize = cardSize;
        Cookie.set("settings.cardSize", cardSize.toString());
    }
};