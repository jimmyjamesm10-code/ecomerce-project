import { Product } from "./product.js"
import { Cart } from "./cart.js"

const cart = new Cart(); //load cart


//-----------------parse products and fix them------------------------------------
let parsedProducts = JSON.parse(localStorage.getItem("products"));
parsedProducts = parsedProducts.map(item =>
    new Product(item.id, item.name, item.price, item.stock, item.category)
);
const products = parsedProducts;


//----------------fix parsed cart-------------------------------------------------------
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


//--------------------render fixed cart--------------------------------------------------
const cartElement = document.getElementById("cart");
function renderCart() {
    cartElement.innerHTML = "";

    const checkoutButton = document.createElement("button");
    checkoutButton.textContent = "Checkout"

    const emptyButton = document.createElement("button");
    emptyButton.textContent = "Empty Cart";

    cart.items.forEach(iitem => {

        const element = document.createElement("div");
        element.textContent = `${iitem.product.name} - R${iitem.product.price} x ${iitem.quantity}`;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove from Cart";
        removeButton.addEventListener("click", () => {
            cart.removeItem(iitem.product);
        });
        cartElement.appendChild(element);
        element.appendChild(removeButton);
    });


    cartElement.appendChild(emptyButton)
        emptyButton.addEventListener("click", () => {
        cart.clearCart();
        total.textContent = "Total Cost: R" + cart.getTotal();
        cartElement.appendChild(emptyButton);
        emptyButton.textContent = "Your Cart is Empty";
    });
    total.textContent = "Total Cost: R" + cart.getTotal();
    
    cartElement.appendChild(checkoutButton)
    
    checkoutButton.addEventListener("click", () => {
        window.location.href = "checkout"
    })
}
renderCart();

//listen for event dispatched after every cart method nad re-render cart.
cart.addEventListener("change", renderCart)

//--------------------------------------------------------------------------------