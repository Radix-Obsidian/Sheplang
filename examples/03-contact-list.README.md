# 📇 Example 3: Contact List

**Estimated Time:** 20 minutes  
**Difficulty:** Intermediate  
**Concepts:** Multiple fields, validation rules, real-world data modeling

---

## 🎯 What You'll Learn

- Working with multiple text fields
- Data validation rules
- Building a simple CRM
- Real-world application structure
- Edit and delete functionality

---

## 🚀 Quick Start

1. **Open in VS Code**
   - Open `03-contact-list.shep`

2. **View the Preview**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)

3. **Try It Out**
   - Click "Add Contact"
   - Enter: Name, Email, Phone, Notes
   - See your contact in the list
   - Click ✏️ to edit
   - Click 🗑️ to delete

---

## 📖 Code Walkthrough

### Frontend (`03-contact-list.shep`)

```sheplang
data Contact:
  fields:
    name: text
    emailAddress: text
    phone: text
    notes: text
  rules:
    - "name is required"
    - "emailAddress must be valid"
```

**New concept:** Multiple fields in one model.

Each field stores different information:
- `name` - Contact's full name
- `emailAddress` - Email address
- `phone` - Phone number
- `notes` - Additional information

**Validation rules** ensure data quality:
- Name must be provided
- Email must be in valid format

```sheplang
action AddContact(name, emailAddress, phone, notes):
  add Contact with name, emailAddress, phone, notes
  show ContactList
```

**Multiple parameters** - action accepts 4 inputs from the user.

### Backend (`03-contact-list.shepthon`)

```shepthon
model Contact {
  id: id
  name: text
  emailAddress: text
  phone: text
  notes: text
}
```

Backend model matches frontend exactly.

```shepthon
endpoint POST "/contacts" {
  const { name, emailAddress, phone, notes } = request.body
  const contact = db.contacts.create({
    name: name,
    emailAddress: emailAddress,
    phone: phone,
    notes: notes
  })
  return contact
}
```

**Destructuring** extracts all fields from the request body.

---

## ✨ Real-World Application

This is a **mini-CRM** (Customer Relationship Management) system!

### Use Cases

1. **Personal Contact Book**
   - Store friends and family contacts
   - Add notes about last conversation
   - Keep phone numbers organized

2. **Small Business CRM**
   - Track customer information
   - Add notes about customer preferences
   - Manage leads and contacts

3. **Event Organizer**
   - Store attendee information
   - Track RSVPs
   - Add dietary restrictions in notes

---

## 🎓 Key Concepts

### Multiple Fields

```sheplang
fields:
  name: text
  emailAddress: text
  phone: text
```

- Each field stores different data
- All fields are independent
- Fields can have different types
- Frontend and backend must match

### Action Parameters

```sheplang
action AddContact(name, emailAddress, phone, notes):
```

- Actions can accept multiple parameters
- Parameters come from user input
- Use parameter names in the action body
- Match parameter order with form fields

### Data Validation

```sheplang
rules:
  - "name is required"
  - "emailAddress must be valid"
```

- Validates data before saving
- Prevents bad data in database
- Gives users helpful error messages
- Improves data quality

---

## 🔄 Try These Modifications

### Challenge 1: Add a Company Field

Add company information:

**Frontend:**
```sheplang
data Contact:
  fields:
    name: text
    emailAddress: text
    phone: text
    company: text  # ← Add this
    notes: text
```

**Backend:**
```shepthon
model Contact {
  id: id
  name: text
  emailAddress: text
  phone: text
  company: text  # ← Add this
  notes: text
}
```

**Action:**
```sheplang
action AddContact(name, emailAddress, phone, company, notes):
  add Contact with name, emailAddress, phone, company, notes
  show ContactList
```

### Challenge 2: Add Status Field

Track if contact is "active" or "inactive":
```sheplang
status: text = "active"
```

### Challenge 3: Add Date Added

Track when contact was created:
```sheplang
createdDate: date
```

---

## 🆚 Comparison

**Traditional Way (React + API):**
```javascript
// Frontend state
const [contacts, setContacts] = useState([]);
const [name, setName] = useState('');
const [emailAddress, setEmail] = useState('');
// ... more useState hooks

// Form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, emailAddress, phone, notes })
    });
    const newContact = await response.json();
    setContacts([...contacts, newContact]);
  } catch (error) {
    console.error(error);
  }
};

// Backend (Express)
app.post('/api/contacts', async (req, res) => {
  const { name, emailAddress, phone, notes } = req.body;
  // Validation logic
  // Database query
  // Error handling
});
```

**ShepLang Way:**
```sheplang
action AddContact(name, emailAddress, phone, notes):
  add Contact with name, emailAddress, phone, notes
  show ContactList
```

---

## 🐛 Common Issues

**Q: Input box only shows one field?**  
A: When you click "Add Contact", VS Code shows an input box. The preview currently supports the full CRUD workflow with edit/delete buttons.

**Q: How do I edit contacts?**  
A: Click the ✏️ (pencil) icon next to any contact. The edit functionality is built into the preview panel.

**Q: Validation rules not working?**  
A: Validation is defined in the `rules` section. The extension shows these as documentation, and the runtime can enforce them.

---

## 📊 Data Structure

```
Contact
├── id: "c1"
├── name: "John Doe"
├── emailAddress: "john@example.com"
├── phone: "555-0123"
└── notes: "Met at conference"
```

---

## ➡️ Next Steps

**Completed:** ✅ Multiple fields, validation, CRUD operations  
**Next:** [Example 4: Dog Reminders](./04-dog-reminders.README.md) - Learn background jobs

---

**Prerequisites:** Examples 1-2  
**Estimated Time:** 20 minutes  
**Your Time:** ___ minutes

🎉 **Congratulations!** You've built a real-world CRM application!
