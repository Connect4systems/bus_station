frappe.ready(function() {
  let selectedItem = null;
  let selectedCustomer = null;

  // إنشاء حقل اختيار السيارة (العميل)
  frappe.call({
    method: "frappe.client.get_list",
    args: {
      doctype: "Customer",
      fields: ["name", "customer_name"],
      limit_page_length: 100
    },
    callback: function(r) {
      const customerSection = document.getElementById('customer-section');
      const select = document.createElement('select');
      select.className = "form-control";

      const defaultOption = document.createElement('option');
      defaultOption.value = "";
      defaultOption.innerText = "-- اختر السيارة (العميل) --";
      select.appendChild(defaultOption);

      r.message.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.name;
        option.innerText = customer.customer_name || customer.name;
        select.appendChild(option);
      });

      select.onchange = function() {
        selectedCustomer = this.value;
      };

      customerSection.appendChild(select);
    }
  });

  // تحميل وعرض المنتجات (الاتجاهات) كصور
  frappe.call({
    method: "frappe.client.get_list",
    args: {
      doctype: "Item",
      fields: ["name", "item_name", "image"],
      limit_page_length: 100
    },
    callback: function(r) {
      const container = document.getElementById('item-section');
      r.message.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.innerHTML = `
          <img src="${item.image || ''}" style="width:100px;height:100px;"><br>
          <strong>${item.item_name}</strong>
        `;
        itemCard.style.border = "1px solid #ccc";
        itemCard.style.display = "inline-block";
        itemCard.style.margin = "10px";
        itemCard.style.padding = "10px";
        itemCard.style.cursor = "pointer";
        itemCard.style.textAlign = "center";
        itemCard.onclick = function() {
          selectedItem = item.name;
          document.querySelectorAll('#item-section div').forEach(div => div.style.backgroundColor = '');
          this.style.backgroundColor = '#d1e7dd';
        };
        container.appendChild(itemCard);
      });
    }
  });

  // زر الخروج
  document.getElementById('save-exit').onclick = function() {
    if (!selectedCustomer || !selectedItem) {
      frappe.msgprint("❗ يرجى اختيار السيارة والاتجاه قبل الحفظ.");
      return;
    }
    frappe.call({
      method: "bus_station.api.create_exit_invoice",
      args: {
        customer: selectedCustomer,
        item: selectedItem
      },
      callback: function(r) {
        if (r.message) {
          frappe.msgprint("✅ تم تسجيل الخروج بنجاح وطباعة الإيصال!");
          window.open(frappe.urllib.get_full_url('/printview?doctype=Sales Invoice&name=' + r.message + '&format=Standard&no_letterhead=0'));
          location.reload();
        }
      }
    });
  };
});
