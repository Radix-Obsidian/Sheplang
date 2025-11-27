// InvoiceApp with Payments feature (Test 2)
app InvoiceApp {

  // === DATA MODELS ===
  
  data User {
    fields: {
      name: text
      email: email
      company: text
      created: date
    }
  }
  
  data Client {
    fields: {
      name: text
      email: email
      company: text
      phone: text
      address: text
    }
  }
  
  data Invoice {
    fields: {
      number: text
      client: ref[Client]
      amount: money
      status: text
      dueDate: date
      created: date
      notes: text
    }
    states: draft -> sent -> paid
    rules: {
      - "user can update own invoices"
      - "client can view their invoices"
    }
  }
  
  data LineItem {
    fields: {
      invoice: ref[Invoice]
      description: text
      quantity: number
      price: money
    }
  }

  // Payments feature added as requested
  data Payment {
    fields: {
      amount: money
      date: date
      method: text
      invoice: ref[Invoice]
      created: date
    }
  }

  // === VIEWS ===
  
  view Dashboard {
    list Invoice
    button "New Invoice" -> CreateInvoice
    button "View Clients" -> ShowClients
    button "Payments" -> ShowPayments
  }
  
  view ClientList {
    list Client
    button "Add Client" -> CreateClient
    button "Back" -> ShowDashboard
  }
  
  view InvoiceDetail {
    list LineItem
    button "Add Item" -> AddLineItem
    button "Send Invoice" -> SendInvoice
    button "Record Payment" -> RecordPayment
    button "Back" -> ShowDashboard
  }
  
  view InvoiceForm {
    button "Save" -> SaveInvoice
    button "Cancel" -> ShowDashboard
  }
  
  view ClientForm {
    button "Save" -> SaveClient
    button "Cancel" -> ShowClients
  }

  view PaymentList {
    list Payment
    button "Back" -> ShowDashboard
  }

  // === ACTIONS ===
  
  action CreateInvoice(clientId, dueDate, notes) {
    add Invoice with number, client, amount, status, dueDate, notes
    show InvoiceDetail
  }
  
  action SaveInvoice(invoiceId, amount, notes) {
    call PUT "/api/invoices" with invoiceId, amount, notes
    load GET "/api/invoices" into invoices
    show Dashboard
  }
  
  action CreateClient(name, email, company, phone, address) {
    call POST "/api/clients" with name, email, company, phone, address
    load GET "/api/clients" into clients
    show ClientList
  }
  
  action SaveClient(clientId, name, email, company) {
    call PUT "/api/clients" with clientId, name, email, company
    load GET "/api/clients" into clients
    show ClientList
  }
  
  action AddLineItem(invoiceId, description, quantity, price) {
    call POST "/api/line-items" with invoiceId, description, quantity, price
    load GET "/api/invoices" into invoices
    show InvoiceDetail
  }
  
  action SendInvoice(invoiceId) {
    call POST "/api/invoices/send" with invoiceId
    show Dashboard
  }
  
  action DeleteInvoice(invoiceId) {
    call DELETE "/api/invoices" with invoiceId
    load GET "/api/invoices" into invoices
    show Dashboard
  }

  action RecordPayment(invoiceId, amount, date, method) {
    call POST "/api/payments" with invoiceId, amount, date, method
    add Payment with amount, date, method, invoice
    call PUT "/api/invoices/update-status" with invoiceId, status: paid
    load GET "/api/payments" into payments
    show PaymentList
  }
  
  action ShowDashboard() {
    load GET "/api/invoices" into invoices
    show Dashboard
  }
  
  action ShowClients() {
    load GET "/api/clients" into clients
    show ClientList
  }

  action ShowPayments() {
    load GET "/api/payments" into payments
    show PaymentList
  }

  // === BACKGROUND JOBS ===
  
  job SendReminders {
    schedule: daily at "09:00"
    action {
      load GET "/api/invoices/overdue" into overdueInvoices
      // Send reminder emails
    }
  }

}
