import mysql from "mysql"
import dotenv from 'dotenv';
dotenv.config();

export const db = mysql.createConnection({
    // host: "socialmysqlserver.mysql.database.azure.com",
    host: "aws-db2.c9wkcmm26naa.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: process.env.DB_PW,
    database: "online_store"
})
