import { PromptCard, ResponseCard } from '../../common/models/Card';

export default interface ServerPack {
    id: string;
    name: string;
    promptCount: number;
    responseCount: number;
    prompts: PromptCard[];
    responses: ResponseCard[];
}


export interface ServerPackGroup {
    name: string;
    orderNumber: number;
    packs: ServerPack[];
}