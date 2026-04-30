from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import datetime
import uuid
from utils.pdf_generator import generate_invoice
from utils.message_service import send_order_confirmation

app = Flask(__name__)
CORS(app)

# Simple JSON-based "Database" for orders
ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'orders.json')
INVOICES_DIR = os.path.join(os.path.dirname(__file__), 'invoices')

if not os.path.exists(INVOICES_DIR):
    os.makedirs(INVOICES_DIR)

def load_orders():
    if os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_orders(orders):
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders, f, indent=4)

@app.route('/api/orders/checkout', methods=['POST'])
def checkout():
    try:
        data = request.json
        orders = load_orders()
        
        new_order = {
            "_id": str(uuid.uuid4()),
            "userId": data.get('userId'),
            "items": data.get('items'),
            "totalAmount": data.get('totalAmount'),
            "paymentStatus": 'Pending',
            "createdAt": datetime.datetime.now().isoformat()
        }
        
        orders.append(new_order)
        save_orders(orders)
        
        return jsonify({"success": True, "orderId": new_order["_id"]}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/orders/payment-webhook', methods=['POST'])
def payment_webhook():
    try:
        data = request.json
        order_id = data.get('orderId')
        transaction_id = data.get('transactionId')
        status = data.get('status')
        
        orders = load_orders()
        order = next((o for o in orders if o["_id"] == order_id), None)
        
        if status == 'success' and order:
            order['paymentStatus'] = 'Paid'
            order['transactionId'] = transaction_id
            save_orders(orders)
            
            print(f"Order {order_id} updated to Paid. Generating invoice...")
            
            # Generate Invoice
            invoice_path = generate_invoice(order)
            
            # Send Notifications
            send_order_confirmation(order, invoice_path)
            
            return jsonify({"success": True, "message": "Payment processed and notifications sent."})
        else:
            return jsonify({"success": False, "message": "Order not found or payment failed"}), 400
            
    except Exception as e:
        print(f"Webhook Error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/orders/history/<user_id>', methods=['GET'])
def history(user_id):
    try:
        orders = load_orders()
        user_orders = [o for o in orders if o["userId"] == user_id]
        # Sort by creation date descending
        user_orders.sort(key=lambda x: x['createdAt'], reverse=True)
        return jsonify({"success": True, "history": user_orders})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/orders/invoice/<order_id>', methods=['GET'])
def download_invoice(order_id):
    filename = f"invoice_{order_id}.pdf"
    if os.path.exists(os.path.join(INVOICES_DIR, filename)):
        return send_from_directory(INVOICES_DIR, filename, as_attachment=True)
    return jsonify({"success": False, "message": "Invoice not found"}), 404

@app.route('/')
def home():
    return "Knight Wolf Python Backend API is running."

if __name__ == '__main__':
    app.run(port=5050, debug=True)
