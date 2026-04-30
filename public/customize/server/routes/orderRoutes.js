const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 1. Create a new order (Status: Pending)
router.post('/checkout', async (req, res) => {
    try {
        const { userId, items, totalAmount } = req.body;

        const newOrder = new Order({
            userId,
            items,
            totalAmount,
            paymentStatus: 'Pending'
        });

        await newOrder.save();
        res.status(201).json({ success: true, orderId: newOrder._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const { generateInvoice } = require('../utils/pdfGenerator');
const { sendOrderConfirmation } = require('../utils/messageService');

// 2. Payment Success Webhook (Status: Update to 'Paid')
router.post('/payment-webhook', async (req, res) => {
    const { orderId, transactionId, status } = req.body;

    try {
        if (status === 'success') {
            const order = await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'Paid',
                transactionId: transactionId
            }, { new: true });

            if (order) {
                console.log(`Order ${orderId} updated to Paid. Generating invoice...`);

                // Trigger Background Tasks
                const invoicePath = await generateInvoice(order);
                await sendOrderConfirmation(order, invoicePath);

                res.json({ success: true, message: 'Payment processed and notifications sent.' });
            } else {
                res.status(404).json({ success: false, message: 'Order not found' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Payment failed' });
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. User Specific History (Status: Filtered by User ID)
router.get('/history/:userId', async (req, res) => {
    try {
        const history = await Order.find({ userId: req.params.userId })
            .sort({ createdAt: -1 }); // Latest orders first

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const path = require('path');
const fs = require('fs');

// 4. Download Invoice PDF
router.get('/invoice/:orderId', (req, res) => {
    const invoicePath = path.join(__dirname, '../invoices', `invoice_${req.params.orderId}.pdf`);

    if (fs.existsSync(invoicePath)) {
        res.download(invoicePath);
    } else {
        res.status(404).json({ success: false, message: 'Invoice not found' });
    }
});

module.exports = router;
