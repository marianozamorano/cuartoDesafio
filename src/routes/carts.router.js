const express = require("express");
const router = express.Router();
const fs = require("fs").promises;

const carts = [];

router.get("/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const cart = await getCartById(cartId);
        if (cart) {
            res.json(cart.products);
        } else {
            res.status(404).send("Carrito no encontrado");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});

router.post("/", async (req, res) => {
    const newCart = {
        id: await generateCartId(),
        products: [],
    };

    try {
        await saveCart(newCart);
        res.status(201).json({ status: "success", message: "Carrito creado correctamente", cart: newCart });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});

router.post("/:cid/product/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = parseInt(req.body.quantity) || 1;

    try {
        let cart = await getCartById(cartId);
        if (!cart) {
            res.status(404).send("Carrito no encontrado");
            return;
        }

        // Buscar el producto en el carrito
        const existingProduct = cart.products.find((item) => item.product === productId);

        if (existingProduct) {
            // Si el producto ya existe, incrementar la cantidad
            existingProduct.quantity += quantity;
        } else {
            // Si el producto no existe, agregarlo al carrito
            cart.products.push({ product: productId, quantity });
        }

        await saveCart(cart);
        res.json({ status: "success", message: "Producto agregado al carrito correctamente", cart: cart.products });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});

let nextCartId = 1;

async function generateCartId() {
    const currentId = nextCartId;
    nextCartId++;
    return currentId.toString();
}

async function saveCart(cart) {
    const filePath = `carrito_${cart.id}.json`;
    await fs.writeFile(filePath, JSON.stringify(cart), "utf-8");
}

async function getCartById(cartId) {
    const filePath = `carrito_${cartId}.json`;

    try {
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            // Si el archivo no existe, retornar null
            return null;
        }
        throw error;
    }
}

module.exports = router;