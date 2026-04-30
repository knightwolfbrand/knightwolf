/**
 * Knight Wolf - Billing Process Test Script
 * This script simulates an end-to-end order flow to verify:
 * 1. Database entry creation
 * 2. PDF Invoice generation
 * 3. Notification service triggers
 */

const mongoose = require('mongoose');
const Order = require('./models/Order');
const { generateInvoice } = require('./utils/pdfGenerator');
const { sendOrderConfirmation } = require('./utils/messageService');

const MONGODB_URI = 'mongodb://localhost:27017/knight-wolf';

async function runTest() {
    console.log('--- STARTING BILLING PROCESS TEST ---');

    try {
        // 1. Connect to DB
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to Database');

        // 2. Create a Mock Order
        const mockOrder = new Order({
            userId: 'TEST_USER_ALPHA',
            items: [
                { name: 'Minimalist Stealth Oversize', size: 'L', quantity: 1, price: 599 },
                { name: 'White Berroless Tee', size: 'M', quantity: 2, price: 549 }
            ],
            totalAmount: 1697,
            paymentStatus: 'Pending'
        });

        await mockOrder.save();
        console.log('✓ Mock Order Created (Pending)');

        // 3. Simulate Payment Success (Webhook Trigger)
        console.log('... Simulating Payment Success ...');
        const updatedOrder = await Order.findByIdAndUpdate(mockOrder._id, {
            paymentStatus: 'Paid',
            transactionId: `TEST-TXN-${Date.now()}`
        }, { new: true });

        console.log('✓ Order Updated to PAID');

        // 4. Generate Invoice
        console.log('... Generating PDF Invoice ...');
        const invoicePath = await generateInvoice(updatedOrder);
        console.log(`✓ Invoice Generated at: ${invoicePath}`);

        // 5. Trigger Notifications
        console.log('... Triggering Notification Services ...');
        await sendOrderConfirmation(updatedOrder, invoicePath);
        console.log('✓ Notification Flow Completed (Check logs above)');

        console.log('\n--- TEST SUCCESSFUL ---');
        console.log('You can now check the "server/invoices" folder for the PDF.');

    } catch (error) {
        console.error('X TEST FAILED:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

runTest();
