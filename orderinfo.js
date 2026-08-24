export class OrderInfo {
    constructor(customerInfo, items, total) {
        this.customerInfo = customerInfo;
        this.items = items;
        this.total = total;
        this.orderId = crypto.randomUUID();
        this.orderDate = new Date();
        this.save();
    }

    save() {

        if (!Array.isArray(this.items)) {
            return;
        }
        
        localStorage.setItem("orders", JSON.stringify(this));
    }
}