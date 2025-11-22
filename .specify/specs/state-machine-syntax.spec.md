# State Machine Syntax Specification

**Version:** 2.0.0  
**Date:** November 21, 2025  
**Status:** 🟡 IN DEVELOPMENT  
**Research:** Langium Grammar + Finite State Automata

---

## 🎯 **Specification Goal**

Extend ShepLang with state machine syntax for modeling order status, user roles, approval workflows, and other stateful business processes.

---

## 📖 **Research Foundation**

### **Langium Grammar Patterns**
Based on [Langium Grammar Documentation](https://langium.org/docs/reference/grammar-language/):

```langium
// Alternatives using | operator
Status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Assignments for transitions
Transition: from=Status '->' to=Status;

// Arrays for multiple transitions
StateRule: status=Status transitions+=Transition*;
```

### **Finite State Automata Principles**
- **States**: Discrete conditions (pending, processing, shipped)
- **Transitions**: Valid movements between states
- **Events**: Triggers that cause transitions
- **Guards**: Conditions that control transitions

---

## 🚀 **Syntax Design**

### **Basic State Declaration**
```sheplang
data Order:
  fields:
    items: list(text)
    total: number
  status: pending -> processing -> shipped -> delivered
          pending -> cancelled
```

### **Advanced State Machine with Events**
```sheplang
data User:
  fields:
    email: text
    name: text
  role: guest -> member -> premium -> admin
        member -> suspended
        suspended -> member

workflow UserManagement:
  on guest:
    event Register -> member
    event Block -> suspended
  on member:
    event Upgrade -> premium
    event Suspend -> suspended
  on premium:
    event Downgrade -> member
    event Suspend -> suspended
  on suspended:
    event Restore -> member
```

### **Complex Order Workflow**
```sheplang
data Order:
  fields:
    items: list(text)
    total: number
    paymentToken: text
  status: pending -> processing -> shipped -> delivered
          pending -> cancelled
          processing -> refunding -> refunded

workflow OrderFulfillment:
  on pending:
    event ProcessPayment:
      if payment.success -> processing
      else -> cancelled
  on processing:
    event ShipOrder -> shipped
    event InitiateRefund -> refunding
  on shipped:
    event MarkDelivered -> delivered
  on refunding:
    event CompleteRefund -> refunded
```

---

## 🛠️ **Grammar Implementation**

### **Extended Langium Grammar**
```langium
// Add to shep.langium

StatusDeclaration:
  'status:' states+=StatusState transitions+=StatusTransition*;

StatusState:
  name=ID;

StatusTransition:
  from=ID '->' to=ID;

WorkflowDeclaration:
  'workflow' name=ID ':' events+=WorkflowEvent*;

WorkflowEvent:
  'on' state=ID ':' actions+=WorkflowAction*;

WorkflowAction:
  'event' name=ID (':' condition=WorkflowCondition)? '->' target=ID;

WorkflowCondition:
  'if' expression=EXPRESSION 'else' alternative=ID;
```

### **AST Type Extensions**
```typescript
// Add to types.ts

export interface StatusDeclaration extends AstNode {
  states: StatusState[];
  transitions: StatusTransition[];
}

export interface StatusTransition extends AstNode {
  from: string;
  to: string;
}

export interface WorkflowDeclaration extends AstNode {
  name: string;
  events: WorkflowEvent[];
}

export interface WorkflowEvent extends AstNode {
  state: string;
  actions: WorkflowAction[];
}
```

---

## 📊 **Generated Database Schema**

### **Basic Status Enum**
```prisma
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model Order {
  id     String      @id @default(uuid())
  items  String[]
  total  Float
  status OrderStatus @default(PENDING)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### **State Transition Log**
```prisma
model OrderStatusHistory {
  id        String      @id @default(uuid())
  orderId   String
  fromStatus OrderStatus?
  toStatus   OrderStatus
  event     String
  timestamp DateTime    @default(now())
  
  order Order @relation(fields: [orderId], references: [id])
}
```

---

## 🌐 **Generated API Endpoints**

### **State Transition Endpoints**
```typescript
// POST /api/orders/:id/transition
router.post('/:id/transition', async (req, res) => {
  const { orderId } = req.params;
  const { event, ...data } = req.body;
  
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });
  
  const newStatus = validateTransition(order.status, event);
  
  if (!newStatus) {
    return res.status(400).json({ 
      error: `Invalid transition: ${event} from ${order.status}` 
    });
  }
  
  // Log state transition
  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus: order.status,
      toStatus: newStatus,
      event
    }
  });
  
  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  });
  
  res.json(updatedOrder);
});

// GET /api/orders/:id/transitions
router.get('/:id/transitions', async (req, res) => {
  const history = await prisma.orderStatusHistory.findMany({
    where: { orderId: req.params.id },
    orderBy: { timestamp: 'desc' }
  });
  res.json(history);
});
```

### **Transition Validation Logic**
```typescript
// Generated from workflow definition
const ORDER_TRANSITIONS = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'REFUNDING'],
  SHIPPED: ['DELIVERED'],
  REFUNDING: ['REFUNDED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: []
};

function validateTransition(currentStatus: OrderStatus, event: string): OrderStatus | null {
  const allowedStatuses = ORDER_TRANSITIONS[currentStatus];
  
  // Event-to-status mapping (generated from workflow)
  const eventMapping = {
    'ProcessPayment': 'PROCESSING',
    'ShipOrder': 'SHIPPED',
    'MarkDelivered': 'DELIVERED',
    'Cancel': 'CANCELLED'
  };
  
  const targetStatus = eventMapping[event];
  
  if (targetStatus && allowedStatuses.includes(targetStatus)) {
    return targetStatus as OrderStatus;
  }
  
  return null;
}
```

---

## 🎨 **Generated Frontend Components**

### **Status Display Component**
```tsx
interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    PENDING: { color: 'yellow', label: 'Pending' },
    PROCESSING: { color: 'blue', label: 'Processing' },
    SHIPPED: { color: 'purple', label: 'Shipped' },
    DELIVERED: { color: 'green', label: 'Delivered' },
    CANCELLED: { color: 'red', label: 'Cancelled' },
    REFUNDED: { color: 'gray', label: 'Refunded' }
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={`px-2 py-1 rounded text-sm bg-${config.color}-100 text-${config.color}-800`}>
      {config.label}
    </span>
  );
}
```

### **State Transition Interface**
```tsx
interface OrderActionsProps {
  order: Order;
  onTransition: (event: string) => void;
}

export function OrderActions({ order, onTransition }: OrderActionsProps) {
  const availableActions = getAvailableActions(order.status);
  
  return (
    <div className="flex gap-2">
      {availableActions.map(action => (
        <button
          key={action.event}
          onClick={() => onTransition(action.event)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function getAvailableActions(status: OrderStatus) {
  const actionMap = {
    PENDING: [
      { event: 'ProcessPayment', label: 'Process Payment' },
      { event: 'Cancel', label: 'Cancel Order' }
    ],
    PROCESSING: [
      { event: 'ShipOrder', label: 'Ship Order' },
      { event: 'InitiateRefund', label: 'Refund' }
    ],
    SHIPPED: [
      { event: 'MarkDelivered', label: 'Mark Delivered' }
    ]
  };
  
  return actionMap[status] || [];
}
```

---

## ✅ **Success Criteria**

### **Grammar Extension**
- [ ] Langium grammar accepts state machine syntax
- [ ] AST correctly represents states and transitions
- [ ] Mapper converts state machines to data structures

### **Database Generation**
- [ ] Generates proper enum types for states
- [ ] Creates status history tables
- [ ] Adds proper foreign key constraints

### **API Generation**
- [ ] Creates transition endpoints for each entity
- [ ] Implements validation logic
- [ ] Provides status history endpoints

### **Frontend Generation**
- [ ] Creates status display components
- [ ] Generates transition action buttons
- [ ] Shows transition history timeline

### **Real-World Example**
- [ ] Complete order management workflow
- [ ] User role management system
- [ ] Content approval workflow

---

## 🔗 **Dependencies**

### **Grammar Changes**
- Update `shep.langium` with state machine syntax
- Extend AST types in `types.ts`
- Update mapper in `mapper.ts`

### **Template Changes**
- Database schema templates for enums
- API route templates for transitions
- Frontend component templates for status UI

### **Validation**
- State transition validation logic
- Circular dependency detection
- Unreachable state analysis

---

*Specification completed based on official Langium documentation and finite state automata principles*
