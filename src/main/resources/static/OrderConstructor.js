export class orderConstructor {
    constructor(customerInfo, items, total) {
        this.customerInfo = customerInfo;
        this.items = items;
        this.total = total;
        this.orderDate = new Date();
    }
}