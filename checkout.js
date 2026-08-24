import { Cart } from "./cart.js"

const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

console.log(cartItems)

const checkoutTotal = document.querySelector("#checkout-total");
cartItems.forEach(element => {
});