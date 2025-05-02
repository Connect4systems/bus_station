import frappe

@frappe.whitelist(allow_guest=True)
def create_exit_invoice(customer, item):
    try:
        price_list = frappe.db.get_value('Customer', customer, 'default_price_list') or 'Standard Selling'

        price = frappe.db.get_value('Item Price', {
            'price_list': price_list,
            'item_code': item
        }, 'price_list_rate')

        if not price:
            price = 1  # fallback if no price

        invoice = frappe.new_doc('Sales Invoice')
        invoice.customer = customer
        invoice.append('items', {
            'item_code': item,
            'qty': 1,
            'rate': price
        })
        invoice.set_missing_values()
        invoice.insert(ignore_permissions=True)
        invoice.submit()

        return invoice.name

    except Exception as e:
        frappe.log_error(title="Bus Exit Invoice Error", message=frappe.get_traceback())
        frappe.throw(f"فشل إنشاء الفاتورة: {str(e)}")
