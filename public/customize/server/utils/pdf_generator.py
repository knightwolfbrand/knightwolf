from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os
import datetime

def generate_invoice(order):
    invoices_dir = os.path.join(os.path.dirname(__file__), '../invoices')
    if not os.path.exists(invoices_dir):
        os.makedirs(invoices_dir)
        
    file_name = f"invoice_{order['_id']}.pdf"
    file_path = os.path.join(invoices_dir, file_name)
    
    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    # Header
    c.setFont("Helvetica-Bold", 25)
    c.drawCentredString(width/2, height - 50, "KNIGHT WOLF")
    
    c.setFont("Helvetica", 10)
    c.drawCentredString(width/2, height - 65, "STREETWEAR FOR THE ALPHAS")
    
    c.setLineWidth(2)
    c.line(50, height - 80, 550, height - 80)

    # Order Info
    c.setFont("Helvetica", 12)
    c.setFillColor(colors.HexColor("#444444"))
    c.drawString(50, height - 110, f"Order ID: {order['_id']}")
    
    date_str = datetime.datetime.fromisoformat(order['createdAt']).strftime('%Y-%m-%d')
    c.drawString(50, height - 125, f"Date: {date_str}")
    c.drawString(50, height - 140, f"Customer ID: {order['userId']}")
    
    c.setFillColor(colors.green)
    c.drawString(50, height - 155, "Status: PAID")
    
    # Table Header
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 12)
    table_top = height - 190
    c.drawString(50, table_top, "Item")
    c.drawString(250, table_top, "Size")
    c.drawString(350, table_top, "Qty")
    c.drawString(450, table_top, "Price")
    
    c.setLineWidth(1)
    c.line(50, table_top - 5, 550, table_top - 5)
    
    # Items
    c.setFont("Helvetica", 11)
    c.setFillColor(colors.HexColor("#333333"))
    current_y = table_top - 25
    
    for item in order['items']:
        c.drawString(50, current_y, item['name'])
        c.drawString(250, current_y, item['size'])
        c.drawString(350, current_y, str(item['quantity']))
        c.drawString(450, current_y, f"Rs.{item['price']}")
        current_y -= 20
        
    # Total
    c.setLineWidth(2)
    c.line(50, current_y - 10, 550, current_y - 10)
    
    c.setFont("Helvetica-Bold", 15)
    c.drawRightString(550, current_y - 30, f"TOTAL AMOUNT: Rs.{order['totalAmount']}")
    
    # Footer
    c.setFont("Helvetica-Oblique", 12)
    c.drawCentredString(width/2, 100, "Thank you for joining the Wolf Pack.")
    
    c.save()
    return file_path
