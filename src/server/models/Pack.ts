import { PromptCard, ResponseCard } from '../../common/models/Card';

export default interface Pack {
    id: string;
    name: string;
    promptCount: number;
    responseCount: number;
    prompts: PromptCard[];
    responses: ResponseCard[];
}