const express = require('express');
const { dbQuery } = require('../lib/db');
const { executeQuery } = require('../lib/dbHelper');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: 'Transaction Id is missing' });
        }

        const querySelect = `
            SELECT 
                t.id AS transaction_id,
                t.total,
                t.subtotal,
                t.created_at,
                
                c.id AS customer_id,
                c.name AS customer_name,
                c.phone AS customer_phone,
                c.code AS customer_code,
                
                p.id AS payment_id,
                p.name AS payment_method,
                p.additional_charge AS payment_additional,
                p.type AS payment_type,
                
                d.id AS discount_id,
                d.name AS discount_name,
                d.code AS discount_code,
                
                u.id AS user_id,
                u.username AS user_name
                
            FROM transactions t
            LEFT JOIN customers c ON t.customer_id = c.id
            LEFT JOIN payments p ON t.payment_id = p.id
            LEFT JOIN discounts d ON t.discount_id = d.id
            LEFT JOIN users u ON t.user_id = u.id

            WHERE t.id = ?
        `;

        const [rows] = await dbQuery(querySelect, [id]);

        const transactions = rows?.map((row) => ({
            id: row.transaction_id,
            total: row.total,
            subtotal: row.subtotal,
            created_at: row.created_at,
            customer: {
                id: row.customer_id,
                name: row.customer_name,
                phone: row.customer_phone,
                code: row.customer_code
            },
            payment: {
                id: row.payment_id,
                name: row.payment_method,
                additional_charge: row.payment_additional,
                type: row.payment_type
            },
            discount: row.discount_id
                ? {
                    id: row.discount_id,
                    name: row.discount_name,
                    value: row.discount_code,
                }
                : null,
            user: {
                id: row.user_id,
                username: row.user_name,
            },
        }));

        const query = `
            SELECT tp.id as transaction_product_id, tp.qty as qty,
            p.id AS product_id,
            p.name AS product_name,
            p.price AS product_price,
            cp.name as cp_name,
            cp.id as cp_id,
            cp.price as cp_price
            FROM transaction_product AS tp
            LEFT JOIN products as p ON tp.product_id = p.id
            LEFT JOIN custom_product AS cp ON cp.id = tp.custom_product_id
            WHERE transaction_id = ?
        `;

        const row = await executeQuery(query, [id]);

        const products = [];
        const customItems = [];

        row.forEach((item) => {
            if (item.product_id) {
                products.push({
                    id: item.product_id,
                    name: item.product_name,
                    price: item.product_price,
                    qty: item.qty,
                });
            } else {
                customItems.push({
                    id: item.cp_id,
                    name: item.cp_name,
                    price: item.cp_price,
                    qty: item.qty,
                });
            }
        });

        return res.json({ products: [...products, ...customItems], transaction: transactions[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
