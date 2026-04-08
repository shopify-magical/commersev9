// Simple CockroachDB Proxy Service
// This service runs locally and provides HTTP API access to CockroachDB
// Cloudflare Workers can call this via HTTP

import { Pool } from 'pg';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

// Simple CockroachDB Proxy Service
// This service runs locally and provides HTTP API access to CockroachDB
// Cloudflare Workers can call this via HTTP

const app = express();
const PORT = process.env.PORT || 3001;

// CockroachDB connection from environment variable
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://root@localhost:26257/orbiotal?sslmode=disable';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'cockroachdb' });
});

// Execute SQL query
app.post('/query', async (req, res) => {
  try {
    const { query, params } = req.body;
    
    const result = await pool.query(query, params || []);
    
    res.json({
      success: true,
      results: result.rows,
      rowCount: result.rowCount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get products
app.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM products';
    const params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      products: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create order
app.post('/orders', async (req, res) => {
  try {
    const { customer_id, items, total } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (customer_id, total, status, payment_status) VALUES ($1, $2, $3, $4) RETURNING id',
        [customer_id || null, total, 'pending', 'pending']
      );
      
      const orderId = orderResult.rows[0].id;
      
      // Add order items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES ($1, $2, $3, $4, $5)',
          [orderId, item.product_id, item.quantity, item.price, item.price * item.quantity]
        );
        
        // Update inventory
        await client.query(
          'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
          [item.quantity, item.product_id]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        order_id: orderId,
        status: 'pending',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get orders
app.get('/orders', async (req, res) => {
  try {
    const { customer_id, status } = req.query;
    
    let query = 'SELECT * FROM orders';
    const params = [];
    let paramIndex = 1;
    
    if (customer_id || status) {
      query += ' WHERE';
      const conditions = [];
      
      if (customer_id) {
        conditions.push(` customer_id = $${paramIndex++}`);
        params.push(customer_id);
      }
      
      if (status) {
        conditions.push(` status = $${paramIndex++}`);
        params.push(status);
      }
      
      query += conditions.join(' AND');
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      orders: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get categories
app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY display_order');
    
    res.json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get inventory
app.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.category, p.price, i.quantity, i.reorder_level 
      FROM products p 
      LEFT JOIN inventory i ON p.id = i.product_id
    `);
    
    res.json({
      success: true,
      inventory: result.rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CockroachDB Proxy running on http://localhost:${PORT}`);
  console.log(`📊 Connected to: postgresql://root@localhost:26257/orbiotal`);
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'cockroachdb' });
});

// Execute SQL query
app.post('/query', async (req, res) => {
  try {
    const { query, params } = req.body;
    
    const result = await pool.query(query, params || []);
    
    res.json({
      success: true,
      results: result.rows,
      rowCount: result.rowCount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get products
app.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM products';
    const params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      products: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create order
app.post('/orders', async (req, res) => {
  try {
    const { customer_id, items, total } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (customer_id, total, status, payment_status) VALUES ($1, $2, $3, $4) RETURNING id',
        [customer_id || null, total, 'pending', 'pending']
      );
      
      const orderId = orderResult.rows[0].id;
      
      // Add order items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES ($1, $2, $3, $4, $5)',
          [orderId, item.product_id, item.quantity, item.price, item.price * item.quantity]
        );
        
        // Update inventory
        await client.query(
          'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
          [item.quantity, item.product_id]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        order_id: orderId,
        status: 'pending',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get orders
app.get('/orders', async (req, res) => {
  try {
    const { customer_id, status } = req.query;
    
    let query = 'SELECT * FROM orders';
    const params = [];
    let paramIndex = 1;
    
    if (customer_id || status) {
      query += ' WHERE';
      const conditions = [];
      
      if (customer_id) {
        conditions.push(` customer_id = $${paramIndex++}`);
        params.push(customer_id);
      }
      
      if (status) {
        conditions.push(` status = $${paramIndex++}`);
        params.push(status);
      }
      
      query += conditions.join(' AND');
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      orders: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get categories
app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY display_order');
    
    res.json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get inventory
app.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.category, p.price, i.quantity, i.reorder_level 
      FROM products p 
      LEFT JOIN inventory i ON p.id = i.product_id
    `);
    
    res.json({
      success: true,
      inventory: result.rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CockroachDB Proxy running on http://localhost:${PORT}`);
  console.log(`📊 Connected to: postgresql://root@localhost:26257/orbiotal`);
});
