export class orderConstructor {
    constructor(customerInfo, items, total) {
        this.customerInfo = customerInfo;
        this.items = items;
        this.total = total;
        this.orderId = crypto.randomUUID();
        this.orderDate = new Date();
    }


}