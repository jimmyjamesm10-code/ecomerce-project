export class OrderInfo {
    constructor() {
        this.customerOrders = []
        this.load();
    }

    addOrder(order) {
        const existingOrder = this.customerOrders.find(element => 
            element.customerInfo.email === order.customerInfo.email
        )

        if (existingOrder) {
            order.items.forEach(element => {
                const existingItem = existingOrder.items.find(item => item.product.id === element.product.id)
                if (existingItem) {
                    existingItem.quantity += element.quantity
                } else {
                    existingOrder.items.push(element)
                }
            }); 
            existingOrder.total += order.total
        } else {
            this.customerOrders.push(order)
        }
        this.save();
    }

    save() {
        this.customerOrders.forEach(order => {
            if (!Array.isArray(order.items)) {
                throw new Error("Order items must be an array")
            } 

            if (!order.items.every(item => {
                return item &&
                item.product &&
                typeof item.product.id === 'string' &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
            })) {
                throw new Error("Invalid order items")
            }

            if (typeof order.total !== "number" || order.total < 0) {
                throw new Error("Invalid order total");
            }
        })
        localStorage.setItem("orders", JSON.stringify(this.customerOrders));
    }
    load() {
        const savedOrders = localStorage.getItem("orders");
        if (!savedOrders) {
            return;
        }

        try {
            const parsedOrders = JSON.parse(savedOrders);

            if (Array.isArray(parsedOrders)) {
                this.customerOrders = parsedOrders;
            } else {
                localStorage.removeItem("orders");
            }
        } catch {
            this.customerOrders = [];
            localStorage.removeItem("orders");
        }
    }
}