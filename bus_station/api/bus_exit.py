import frappe

@frappe.whitelist(allow_guest=True)
def create_exit_invoice(customer, item):
    try:
        customer_doc = frappe.get_doc("Customer", customer)
        if not customer_doc:
            frappe.throw("العميل غير موجود.")

        price_list = frappe.db.get_value(
            "Customer Group", customer_doc.customer_group, "default_price_list"
        )

        item_price = frappe.db.get_value(
            "Item Price",
            {"item_code": item, "price_list": price_list},
            "price_list_rate"
        )

        if not item_price:
            frappe.throw(f"لا يوجد سعر للصنف {item} في قائمة الأسعار {price_list}.")

        invoice = frappe.new_doc("Sales Invoice")
        invoice.customer = customer
        invoice.append("items", {
            "item_code": item,
            "qty": 1,
            "rate": item_price,
        })

        invoice.set_missing_values()

        # إعداد الدفع
        invoice.is_pos = 1
        invoice.include_payment = 1
        invoice.pos_profile = frappe.db.get_value('POS Profile', {'user': frappe.session.user}, 'name') or "Gate1"

        # تعبئة مبلغ الدفع مباشرةً
        invoice.paid_amount = item_price

        # أيضاً إضافة دفع يدوي لضمان الدقة
        invoice.append("payments", {
            "mode_of_payment": "Cash",
            "amount": item_price
        })

        invoice.insert(ignore_permissions=True)
        invoice.submit()

        return {"invoice_name": invoice.name}

    except Exception as e:
        frappe.log_error(f"Bus Exit Error: {str(e)}")
        return {"error": str(e)}
