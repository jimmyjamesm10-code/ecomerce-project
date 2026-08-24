import { Product } from "./product.js"
import { Cart } from "./cart.js"
import { OrderInfo } from "./orderinfo.js";

const products = [
    new Product("L001","Laptop", 12000, "", "A Windows 11 Laptop", 10),
    new Product("P001","Phone", 8000, "", "An Iphone 15", 15),
    new Product("K001","Keyboard", 700, "", "A Gaming Keyboard", 20)
];

const cart = new Cart();

cart.items = cart.items
    .map(item => {
        const product = products.find(candidate => candidate.id === item.product?.id);
        const quantity = Number.isInteger(item.quantity) ? item.quantity : 0;

        if (!product || quantity <= 0) {
            return null;
        }

        return {
            product,
            quantity: Math.min(quantity, product.stock)
        };
    })
    .filter(Boolean);
cart.save();

const cartItems = cart.items
const cartTotal = cart.getTotal();

console.log(cartItems)

const checkoutTotal = document.querySelector("#checkout-total");
checkoutTotal.textContent = cartTotal;

function renderCheckout() {
    const checkoutItems = document.getElementById("checkout-items");
    checkoutItems.innerHTML = "";
    const orderButton = document.getElementById("place-order")

    orderButton.disabled = cartItems.length === 0;
    if (cartItems.length === 0) {
        checkoutItems.innerHTML = `<p>Your cart is empty.</p>`
        return;
    }
    
    cartItems.forEach(item => {
        const itemElement = document.createElement("div")
        
        itemElement.innerHTML = `
        <h3>${item.product.name}<h3>
        <p>Price: R${item.product.price}</p>
        <p>Subtotal: R${item.product.price * item.quantity}</p>
        `;
        checkoutItems.appendChild(itemElement);
    });
}

renderCheckout();

const checkoutForm = document.getElementById("checkout-form");

checkoutForm.addEventListener("submit", function(event) {
    event.preventDefault();
    console.log("Checkout submitted")

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;

    const customerInfo = {
        name: name,
        email: email,
        address: address
    }

    const orderInfo = new OrderInfo(customerInfo, cartItems, cartTotal);
    
    cart.items.clearCart();
    
    console.log(orderInfo)
})