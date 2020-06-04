import { PromptCard, ResponseCard } from '../../common/models/Card';

export interface Pack {
    id: string;
    name: string;
    promptCount: Number;
    responseCount: Number;
    prompts: PromptCard[];
    responses: ResponseCard[];
}