-- MedLab Database Setup Script
-- Run this script in MySQL to create the database and table

-- Create database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS medhome;

-- Use the database
USE medhome;

-- Create login table
CREATE TABLE IF NOT EXISTS login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    number VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Show table structure
DESCRIBE login;










