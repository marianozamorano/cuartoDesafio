const express = require("express");
const router = express.Router();
const fs = require("fs").promises;

const products = [];

router.get("/", (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const productList = limit ? products.slice(0, limit) : products;
    res.json(products);
})

router.get("/:pid", (req, res) => {
    const productId = req.params.pid;
    const product = products.find((p) => p.id === productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).send("Producto no encontrado");
    }
});

router.post("/", (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    const newProduct = {
        id: generateProductId(),
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails,
    };

    products.push(newProduct);

    io.emit("updateProducts", products);

    res.status(201).json({ status: "success", message: "Producto creado correctamente", product: newProduct });
});

router.put("/:pid", (req, res) => {
    const productId = req.params.pid;
    const updatedProductIndex = products.findIndex((p) => p.id === productId);

    if (updatedProductIndex !== -1) {
        const updatedProduct = { ...products[updatedProductIndex], ...req.body };
        products[updatedProductIndex] = updatedProduct;
        res.json({ status: "success", message: "Producto actualizado correctamente", product: updatedProduct });
    } else {
        res.status(404).send("Producto no encontrado");
    }
});

router.delete("/:pid", (req, res) => {
    const productId = req.params.pid;
    const deletedProductIndex = products.findIndex((p) => p.id === productId);

    if (deletedProductIndex !== -1) {
        const deletedProduct = products.splice(deletedProductIndex, 1);

        io.emit("updateProducts", products);
        
        res.json({ status: "success", message: "Producto eliminado correctamente", product: deletedProduct });
    } else {
        res.status(404).send("Producto no encontrado");
    }
});

let nextProductId = 1;

function generateProductId() {
    const currentId = nextProductId;
    nextProductId++;
    return currentId.toString();
}

module.exports = router;