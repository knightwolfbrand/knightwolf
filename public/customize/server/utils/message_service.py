# Simple message service mock for Python backend

def send_order_confirmation(order, invoice_path):
    print(f"[MessageService] Preparing notifications for Order: {order['_id']}")
    
    # Simulate WhatsApp Message
    print(f"[WhatsApp] Sending to User {order['userId']}: \"Your Knight Wolf order is confirmed! Transaction ID: {order.get('transactionId', 'N/A')}. Download your bill here: [link]\"")

    # Simulate SMS Message
    print(f"[SMS] Sending to User {order['userId']}: \"KNIGHT WOLF: Order {order['_id']} paid. Download invoice: kwolf.co/inv/{order['_id']}\"")

    return True
