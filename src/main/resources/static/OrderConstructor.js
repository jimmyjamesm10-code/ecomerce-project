export class orderConstructor {
    constructor(items, total, status) {
        this.items = items;
        this.total = total;
        this.status = status;
        this.orderDate = new Date();
    }
}