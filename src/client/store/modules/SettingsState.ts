/// <
import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
import Cookies from 'js-cookie';

@Module
export default class SettingsState extends VuexModule {
    cardSize: number = parseInt(Cookies.get("settings.cardSize")) || 5;
    inlineCards: boolean = Cookies.get("settings.inlineCards") == "true";

    @Mutation
    updateCardSize(cardSize: number) {
        this.cardSize = cardSize;
        Cookies.set("settings.cardSize", cardSize.toString(), { sameSite: 'Strict' });
    }

    @Mutation
    updateInlineCards(inlineCards: boolean) {
        this.inlineCards = inlineCards;
        Cookies.set("settings.inlineCards", inlineCards ? "true" : "false", { sameSite: 'Strict' });
    }
};