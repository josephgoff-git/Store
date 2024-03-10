import { db } from "../connect.js";

export const getProducts = (req, res) => {
    const q = `SELECT * FROM products`;

    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
};