const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `invoice_${order._id}.pdf`;
        const filePath = path.join(__dirname, '../invoices', fileName);

        // Ensure invoices directory exists
        const dir = path.join(__dirname, '../invoices');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fillColor('#000000').fontSize(25).font('Helvetica-Bold').text('KNIGHT WOLF', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text('STREETWEAR FOR THE ALPHAS', { align: 'center' });
        doc.moveDown();
        doc.rect(50, doc.y, 500, 2).fill('#000000');
        doc.moveDown();

        // Order Info
        doc.fillColor('#444444').fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.text(`Customer ID: ${order.userId}`);
        doc.text(`Status: PAID`, { color: '#008000' });
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold').fillColor('#000000');
        doc.text('Item', 50, tableTop);
        doc.text('Size', 250, tableTop);
        doc.text('Qty', 350, tableTop);
        doc.text('Price', 450, tableTop);
        doc.moveDown();
        doc.rect(50, doc.y, 500, 1).fill('#cccccc');
        doc.moveDown();

        // Items
        let currentY = doc.y;
        order.items.forEach(item => {
            doc.font('Helvetica').fillColor('#333333');
            doc.text(item.name, 50, currentY);
            doc.text(item.size, 250, currentY);
            doc.text(item.quantity.toString(), 350, currentY);
            doc.text(`₹${item.price}`, 450, currentY);
            currentY += 20;
        });

        // Footer
        doc.rect(50, currentY + 20, 500, 2).fill('#000000');
        doc.fontSize(15).font('Helvetica-Bold').text(`TOTAL AMOUNT: ₹${order.totalAmount}`, 50, currentY + 40, { align: 'right' });

        doc.moveDown(5);
        doc.fontSize(12).font('Helvetica-Oblique').text('Thank you for joining the Wolf Pack.', { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};

module.exports = { generateInvoice };
