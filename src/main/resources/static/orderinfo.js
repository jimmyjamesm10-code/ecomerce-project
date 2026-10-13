import { Product } from "./product.js";

export class OrderInfo {
    constructor() {
        this.customerOrders = []
        this.load();
    }


    /*addOrder(order) {
        const existingOrder = this.customerOrders.find(element => 
            element.customerInfo.email === order.customerInfo.email
        )


        if (existingOrder) {
            order.items.forEach(element => {
                const baseItem = this.baseInventory.find(item => item.id === element.product.id)
                const existingItem = existingOrder.items.find(item => item.product.id === element.product.id)
                const existingItemQuantity = existingItem ? existingItem.quantity : 0
                const remainingStock = baseItem.stock - existingItemQuantity; //baseItem.stock must be the base stock quantity. it shouldn't change. thats where baseInventory comes in.
                if (element.quantity > remainingStock) {
                    return;
                }

                if (existingItem) {
                    existingItem.quantity += element.quantity
                } else {
                    existingOrder.items.push(element)
                }
            });
            existingOrder.total += order.total;
            console.log(existingOrder) 
        } else {
            this.customerOrders.push(order)
        }
        this.save();
    }*/




    save() {
        this.customerOrders.forEach(order => {
            //check customer info
            if (!order.customerInfo || typeof order.customerInfo !== "object"){
                throw new Error("Invalid customer info")
            }
            const name_chars = []
            for (let char of order.customerInfo.name) {
                name_chars.push(char)
            }
            if (!order.customerInfo.name || typeof order.customerInfo.name !== "string" || 
                name_chars.some((char) => !"ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ".includes(char))) {
                    console.log(order.customerInfo.name)
                    throw new Error("Invalid customer name");
            }
            if (!order.customerInfo.email || typeof order.customerInfo.email !== "string"){
                throw new Error("Invalid customer email");
            }
            if (order.customerInfo.email.slice(-10) !== "@gmail.com") {
                throw new Error("Invalid email format")
            }
            if (!order.customerInfo.address || typeof order.customerInfo.address !== "string") {
                throw new Error("Invalid customer address")
            }

            //check items
            if (!Array.isArray(order.items)) {
                throw new Error("Order items must be an array")
            }
            
            if (order.items.some(item => !Number.isInteger(item.product.id) 
                || typeof item.product.name !== "string"
                || !Number.isInteger(item.product.stock) 
                || typeof item.product.category !== "string")) {
                    throw Error("product field type mismatch on id, name, stock or category");
                }

            if (!order.items.every(item => {
                return item &&
                item.product &&
                Number.isInteger(item.product.id) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
                })) {
                     throw new Error("Invalid order items");
                }

            //check total
            if (typeof order.total !== "number" || !isFinite(order.total) || order.total <= 0) {
                throw new Error("Invalid order total");
            }

            //check total accuracy
            const calculatedTotal = order.items.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0);

            if (Math.abs(calculatedTotal - order.total) > 0.01) {
                console.log(order.total)
                console.log(Math.abs(calculatedTotal - order.total))
                throw new Error("Order total does not match item sum")
            }
        })
    
        localStorage.setItem("orders", JSON.stringify(this.customerOrders));
        console.log("Checkout submitted") 
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