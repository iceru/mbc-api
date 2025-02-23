const express = require('express');
const { db } = require('../lib/db');
const { pagination } = require('../lib/pagination');
// const { verifyToken } = require('../../middleware/verifyToken'); // Uncomment if using token verification

const router = express.Router();

router.get('/', async (req, res) => {

    try {
        const { sort, type, page = '1', limit = '20', session } = req.query;

        const query = `
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

            ${session ? `WHERE session_id = ?` : ''}
            ${sort ? `ORDER BY ${sort} ${type}` : ''}
        `;

        const params = session ? [session] : [];
        const [rows] = await db.query(query, params);

        let transactions = rows?.map((row) => ({
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

        const { totalPages, index } = pagination(transactions, limit, page);
        transactions = transactions.slice(index, index + parseInt(limit));

        return res.json({ transactions, totalPages, currentPage: parseInt(page) });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Server error - ${error.message}` });
    }
});

module.exports = router;
