const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true // Efficient for user-specific history lookups
    },
    items: [{
        productId: String,
        name: { type: String, required: true },
        color: { type: String, default: 'Black' },
        size: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        isCustom: { type: Boolean, default: false },
        texture: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    transactionId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Helper virtual for full product string (e.g., "Knight Wolf Premium Tee - Black - Size L")
OrderSchema.virtual('fullProductDescriptions').get(function () {
    return this.items.map(item => `${item.name} - ${item.color} - Size ${item.size}`);
});

module.exports = mongoose.model('Order', OrderSchema);
