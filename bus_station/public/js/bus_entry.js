let selectedItem = null;
let selectedCustomer = null;

// جلب العملاء
fetch('/api/resource/Customer?limit_page_length=100')
  .then(response => response.json())
  .then(data => {
    const customers = data.data;
    const customerSection = document.getElementById('customer-section');
    const select = document.createElement('select');
    select.className = "form-control";

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.innerText = "-- اختر السيارة (العميل) --";
    select.appendChild(defaultOption);

    customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.name;
      option.innerText = customer.customer_name || customer.name;
      select.appendChild(option);
    });

    select.onchange = function() {
      selectedCustomer = this.value;
    };

    customerSection.appendChild(select);
  });

// جلب المنتجات
fetch('/api/resource/Item?limit_page_length=100')
  .then(response => response.json())
  .then(data => {
    const items = data.data;
    const container = document.getElementById('item-section');

    items.forEach(item => {
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
  });

// عند الضغط على حفظ الدخول
document.getElementById('save-entry').onclick = function() {
  if (!selectedCustomer || !selectedItem) {
    alert("❗ يرجى اختيار السيارة والاتجاه قبل الحفظ.");
    return;
  }

  fetch('/api/resource/Bus Entry Log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      customer: selectedCustomer,
      item: selectedItem
    })
  })
  .then(response => response.json())
  .then(data => {
    alert("✅ تم تسجيل الدخول بنجاح!");
    location.reload();
  });
};
