import requests
import json
import time

def run_test():
    api_url = "http://localhost:5050/api/orders"
    print("--- STARTING BILLING PROCESS TEST (PYTHON) ---")
    
    # 1. Checkout
    checkout_data = {
        "userId": "TEST_USER_PYTHON",
        "items": [
            {"name": "Minimalist Stealth Oversize", "size": "L", "quantity": 1, "price": 599},
            {"name": "White Berroless Tee", "size": "M", "quantity": 2, "price": 549}
        ],
        "totalAmount": 1697
    }
    
    print("... Creating Order ...")
    try:
        r = requests.post(f"{api_url}/checkout", json=checkout_data)
        try:
            res = r.json()
        except Exception:
            print(f"X Failed to decode JSON. Status: {r.status_code}")
            print(f"Response: {r.text}")
            return

        if not res.get("success"):
            print(f"X Checkout Failed: {res.get('message')}")
            return
        
        order_id = res.get("orderId")
        print(f"✓ Order Created: {order_id}")
        
        # 2. Payment Webhook
        print("... Simulating Payment Success ...")
        webhook_data = {
            "orderId": order_id,
            "transactionId": f"KW-PY-TXN-{int(time.time())}",
            "status": "success"
        }
        
        r = requests.post(f"{api_url}/payment-webhook", json=webhook_data)
        res = r.json()
        if not res.get("success"):
            print(f"X Webhook Failed: {res.get('message')}")
            return
            
        print("✓ Order Paid & Invoice Generated")
        print("Check 'server/invoices' for the PDF and terminal for logs.")
        print("\n--- TEST SUCCESSFUL ---")
        
    except Exception as e:
        print(f"X Test encountered an error: {e}")
        print("Make sure the server is running (python3 server/app.py)")

if __name__ == "__main__":
    run_test()
