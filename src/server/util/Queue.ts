export default class Queue<T> {
    constructor(private queue: T[] = []) {}

    offer(item: T) {
        this.queue.unshift(item);
    }

    poll(andOffer: boolean): T|null {
        if (this.queue.length < 1) {
            return null;
        }

        let item = this.queue.pop();
        if (andOffer) {
            this.offer(item);
        }
        return item;
    }

    remove(item: T) {
        let index = this.queue.indexOf(item);
        if (index < 0) return;

        this.queue.splice(index, 1);
    }
}