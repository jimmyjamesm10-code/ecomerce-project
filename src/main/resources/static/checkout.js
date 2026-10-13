import { Product } from "./product.js"
import { Cart } from "./cart.js"
import { OrderInfo } from "./orderinfo.js";
import { orderConstructor } from "./OrderConstructor.js";


const cart = new Cart();

let parsedProducts = JSON.parse(localStorage.getItem("products"));

parsedProducts = parsedProducts.map(item =>
    new Product(item.id, item.name, item.price, item.stock, item.category, item.image)
);

const products = parsedProducts;


cart.items = cart.items
    .map(item => {
        const product = products.find(candidate => candidate.id === item.product.id);
        const quantity = Number.isInteger(item.quantity) ? item.quantity : 0;

        if (!product || quantity <= 0) {
            return null;
        }

        return {
            product: product,
            quantity: Math.min(quantity, product.stock)
        };
    })
    .filter(Boolean);
cart.save();

const cartItems = cart.items
const cartTotal = cart.getTotal();

console.log(cartItems)

const checkoutTotal = document.querySelector("#checkout-total");
const orderButton = document.getElementById("place-order")


//----------------rendering------------------------------------------

function renderCheckout() {
    const checkoutItems = document.getElementById("checkout-items");
    checkoutItems.innerHTML = "";

    orderButton.disabled = cartItems.length === 0;
    if (cartItems.length === 0) {
        checkoutItems.innerHTML = `<p>Your cart is empty.</p>`
        return;
    }
    const subtotals = [];
    cartItems.forEach(item => {
        const itemElement = document.createElement("div")
        const subtotal = item.product.price * item.quantity
        itemElement.innerHTML = `
        <h3>${item.product.name}<h3>
        <p>Price: R${item.product.price}</p>
        <p>Subtotal: R${subtotal}</p>
        `;
        subtotals.push(subtotal)
        checkoutItems.appendChild(itemElement);
    });

    const total = subtotals.reduce((x, y)=> x+y, 0)
    checkoutTotal.textContent = total;//render total from subtotals
}

renderCheckout();

//------------------------------------------------------------------


const checkoutForm = document.getElementById("checkout-form");
const orders = new OrderInfo()



checkoutForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;

    const customerInfo = {
        name: name, 
        email: email,
        address: address
    }

    const newOrder = new orderConstructor(customerInfo, cartItems, cartTotal)
    /*orders.addOrder(newOrder)
    newOrder.items.forEach(item => {
        inventory.updateInventory(item, item.quantity)
    }) */
    cart.items = []
    cart.save()
    renderCheckout()
    orderButton.disabled = true;
    fetch("http://192.168.230.203:8080/order", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newOrder)
    });
    newOrder.items.forEach(item =>{
        const product = products.find(product => product.id === item.product.id)
        product.updateStock(item.quantity);
    })
})
