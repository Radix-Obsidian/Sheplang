# ShepUI Compiler Implementation Plan
**Version:** 1.0 (Draft)  
**Date:** November 21, 2025  
**Status:** PLAN - Ready for Execution

---

## Overview

ShepUI Compiler transforms screen specifications into:
- React components with TypeScript
- Form handling with validation
- Real-time updates (optimistic, WebSocket-driven)
- Image galleries, rich text editors, multi-step wizards
- Responsive layouts
- Accessibility (WCAG 2.1 AA)
- Mobile-ready by default

---

## Phase 1: Screen Type Parsing (Week 1)

### Goal
Parse ShepLang screen definitions into an intermediate model.

### Deliverables
- ✅ Screen parser (kind, layout, components)
- ✅ Layout parser (container, row, column, list, if/else)
- ✅ Component reference parser
- ✅ Action binding parser
- ✅ Realtime feature parser

### Technical Approach
```typescript
// Input: ShepLang spec
screens:
  MarketplaceHome:
    kind: "feed"
    entity: Listing
    layout:
      - "Header with search"
      - "Grid of listings with infinite scroll"
    filters:
      - "category: ref[Category]"
      - "sortBy: enum[Recent, Popular]"

// Output: Intermediate model
interface ScreenModel {
  name: string;
  kind: 'feed' | 'detail' | 'wizard' | 'dashboard' | 'inbox' | 'list';
  entity?: string;
  layout: LayoutNode[];
  filters?: FilterModel[];
  realtime?: RealtimeFeature[];
  actions?: ActionBinding[];
}

interface LayoutNode {
  type: 'container' | 'row' | 'column' | 'list' | 'if' | 'text' | 'button' | 'input';
  children?: LayoutNode[];
  props?: Record<string, any>;
}
```

### Success Criteria
- ✅ Parse all screen kinds
- ✅ Extract layout structure
- ✅ Identify component references
- ✅ Parse action bindings
- ✅ 100% test coverage

### Dependencies
- ShepLang parser (already exists)
- ShepData types (from ShepData compiler)

---

## Phase 2: Feed Screen Generation (Week 1-2)

### Goal
Generate infinite scroll feed components.

### Deliverables
- ✅ Feed component generator
- ✅ Infinite scroll logic
- ✅ Filter panel generator
- ✅ Real-time updates
- ✅ Skeleton loaders

### Technical Approach
```typescript
// Generated feed component

export function MarketplaceHome() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState({ category: null, sortBy: 'Recent' });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data, isLoading: isFetching } = useListings({ ...filters, page });
  
  useEffect(() => {
    if (data) setListings(prev => [...prev, ...data]);
  }, [data]);
  
  useEffect(() => {
    // Real-time updates
    socket.on('listing:new', (listing) => {
      setListings(prev => [listing, ...prev]);
    });
    return () => socket.off('listing:new');
  }, []);
  
  const handleScroll = (e: UIEvent) => {
    const element = e.currentTarget as HTMLElement;
    if (element.scrollHeight - element.scrollTop < 500) {
      setPage(p => p + 1);
    }
  };
  
  return (
    <div onScroll={handleScroll} className="feed-container">
      <SearchBar />
      <FilterPanel onChange={setFilters} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(l => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
      
      {isFetching && <SkeletonLoader count={3} />}
    </div>
  );
}
```

### Success Criteria
- ✅ Generate infinite scroll
- ✅ Create filter panel
- ✅ Add real-time updates
- ✅ Include skeleton loaders
- ✅ Mobile-responsive

### Dependencies
- Phase 1: Screen type parsing
- ShepData types

---

## Phase 3: Detail Screen Generation (Week 2)

### Goal
Generate detail/single-item screens.

### Deliverables
- ✅ Detail component generator
- ✅ Image gallery generator
- ✅ Related items generator
- ✅ Action button generator
- ✅ Sidebar generator

### Technical Approach
```typescript
// Generated detail component

export function ListingDetail({ listingId }: Props) {
  const { data: listing, isLoading } = useListing(listingId);
  const { mutate: favorite } = useFavoriteListing();
  const [imageIndex, setImageIndex] = useState(0);
  
  useEffect(() => {
    trackView(listingId);
    socket.on('listing:updated', (updated) => {
      setListing(updated);
    });
    return () => socket.off('listing:updated');
  }, [listingId]);
  
  const handleFavorite = () => {
    favorite(listingId, {
      optimisticData: {
        ...listing,
        favorites: [...listing.favorites, currentUser.id]
      }
    });
  };
  
  if (isLoading) return <SkeletonLoader />;
  
  return (
    <div className="max-w-7xl mx-auto px-4">
      <Breadcrumb />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ImageGallery
            images={listing.images}
            currentIndex={imageIndex}
            onChange={setImageIndex}
          />
          <h1 className="text-3xl font-bold mt-6">{listing.title}</h1>
          <RichText content={listing.description} />
          <RelatedListings category={listing.category} />
        </div>
        
        <div className="lg:col-span-1">
          <PriceCard
            price={listing.price}
            onBuyNow={() => initiatePurchase(listing.id)}
            onFavorite={handleFavorite}
          />
          <SellerCard seller={listing.seller} />
        </div>
      </div>
    </div>
  );
}
```

### Success Criteria
- ✅ Generate detail layout
- ✅ Create image gallery
- ✅ Add related items
- ✅ Generate action buttons
- ✅ Include sidebar

### Dependencies
- Phase 1: Screen type parsing
- Image gallery component library

---

## Phase 4: Wizard Screen Generation (Week 2-3)

### Goal
Generate multi-step form wizards.

### Deliverables
- ✅ Wizard component generator
- ✅ Step navigation generator
- ✅ Form validation generator
- ✅ Draft saving generator
- ✅ Progress indicator generator

### Technical Approach
```typescript
// Generated wizard component

export function CreateListing() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const steps = [
    { name: 'Basic Info', validate: validateBasicInfo },
    { name: 'Pricing', validate: validatePricing },
    { name: 'Images', validate: validateImages },
    { name: 'Review', validate: () => ({ valid: true }) }
  ];
  
  const handleNext = async () => {
    const validation = steps[step].validate(formData);
    if (validation.valid) {
      saveDraft(formData);
      setStep(s => s + 1);
    } else {
      setErrors(validation.errors);
    }
  };
  
  const handleBack = () => setStep(s => Math.max(0, s - 1));
  
  const handleSubmit = async () => {
    const result = await publishListing(formData);
    navigate(`/listing/${result.id}`);
  };
  
  return (
    <div className="grid grid-cols-4 gap-8">
      <StepSidebar steps={steps} currentStep={step} />
      
      <div className="col-span-3">
        {step === 0 && <BasicInfoStep data={formData} onChange={setFormData} errors={errors} />}
        {step === 1 && <PricingStep data={formData} onChange={setFormData} errors={errors} />}
        {step === 2 && <ImagesStep data={formData} onChange={setFormData} errors={errors} />}
        {step === 3 && <ReviewStep data={formData} />}
        
        <div className="flex gap-4 mt-8">
          <button onClick={handleBack} disabled={step === 0}>Back</button>
          <button onClick={step === steps.length - 1 ? handleSubmit : handleNext}>
            {step === steps.length - 1 ? 'Publish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Success Criteria
- ✅ Generate multi-step forms
- ✅ Create step navigation
- ✅ Add form validation
- ✅ Include draft saving
- ✅ Show progress indicator

### Dependencies
- Phase 1: Screen type parsing
- Form validation library

---

## Phase 5: Dashboard Generation (Week 3)

### Goal
Generate analytics dashboards with charts and stats.

### Deliverables
- ✅ Dashboard component generator
- ✅ Stats card generator
- ✅ Chart generator (line, bar, pie)
- ✅ Table generator
- ✅ Real-time update generator

### Technical Approach
```typescript
// Generated dashboard component

export function SellerDashboard() {
  const { data: stats } = useSellerStats();
  const { data: revenueChart } = useRevenueChart({ period: '30d' });
  const { data: purchases } = useRecentPurchases();
  
  useEffect(() => {
    // Real-time stat updates
    socket.on('stats:updated', (newStats) => {
      setStats(newStats);
    });
    return () => socket.off('stats:updated');
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Sales" value={stats.totalSales} trend="+12%" />
        <StatCard label="Active Listings" value={stats.activeListings} />
        <StatCard label="Revenue" value={formatCurrency(stats.revenue)} trend="+8%" />
        <StatCard label="Messages" value={stats.pendingMessages} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3>Revenue (30 days)</h3>
          <LineChart data={revenueChart} />
        </Card>
        
        <Card>
          <h3>Top Listings</h3>
          <BarChart data={topListings} />
        </Card>
      </div>
      
      <Card>
        <h3>Recent Purchases</h3>
        <Table
          columns={['Listing', 'Buyer', 'Amount', 'Date']}
          data={purchases}
          sortable
          paginated
        />
      </Card>
    </div>
  );
}
```

### Success Criteria
- ✅ Generate dashboard layout
- ✅ Create stats cards
- ✅ Add charts (line, bar, pie)
- ✅ Generate tables
- ✅ Include real-time updates

### Dependencies
- Phase 1: Screen type parsing
- Chart.js library

---

## Phase 6: Inbox/Messaging Generation (Week 3-4)

### Goal
Generate real-time messaging interfaces.

### Deliverables
- ✅ Inbox component generator
- ✅ Message thread generator
- ✅ Real-time sync generator
- ✅ Typing indicator generator
- ✅ Read receipt generator

### Technical Approach
```typescript
// Generated inbox component

export function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Subscribe to conversations
    socket.emit('subscribe:conversations');
    
    socket.on('conversation:new', (conv) => {
      setConversations(prev => [conv, ...prev]);
    });
    
    socket.on('message:new', (msg) => {
      if (msg.conversationId === activeConversation) {
        setMessages(prev => [...prev, msg]);
      }
    });
    
    socket.on('user:typing', ({ userId, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (isTyping) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });
    
    return () => socket.off('conversation:new');
  }, [activeConversation]);
  
  const handleSendMessage = (content: string) => {
    const message = {
      id: generateId(),
      conversationId: activeConversation,
      sender: currentUser.id,
      content,
      status: 'sending'
    };
    
    // Optimistic update
    setMessages(prev => [...prev, message]);
    
    // Send to server
    socket.emit('message:send', { conversationId: activeConversation, content });
  };
  
  return (
    <div className="grid grid-cols-3 gap-4 h-screen">
      <ConversationList
        conversations={conversations}
        activeId={activeConversation}
        onChange={setActiveConversation}
      />
      
      <div className="col-span-2 flex flex-col">
        <MessageThread messages={messages} />
        {typingUsers.size > 0 && <TypingIndicator users={Array.from(typingUsers)} />}
        <MessageComposer onSend={handleSendMessage} />
      </div>
    </div>
  );
}
```

### Success Criteria
- ✅ Generate inbox layout
- ✅ Create message threads
- ✅ Add real-time sync
- ✅ Include typing indicators
- ✅ Show read receipts

### Dependencies
- Phase 1: Screen type parsing
- Socket.io client

---

## Phase 7: List/Table Generation (Week 4)

### Goal
Generate data tables with sorting, filtering, pagination.

### Deliverables
- ✅ Table component generator
- ✅ Column definition generator
- ✅ Sorting generator
- ✅ Filtering generator
- ✅ Pagination generator
- ✅ Bulk actions generator

### Technical Approach
```typescript
// Generated table component

export function MenuItemsAdmin() {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  
  const { data, total } = useMenuItems({ filters, sort, page, limit: 25 });
  
  const columns = [
    { field: 'name', label: 'Name', sortable: true },
    { field: 'category', label: 'Category', filterable: true },
    { field: 'status', label: 'Status', filterable: true },
    { field: 'createdAt', label: 'Created', sortable: true }
  ];
  
  const handleBulkDelete = async () => {
    await deleteMenuItems(Array.from(selected));
    setSelected(new Set());
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <SearchBar onChange={(q) => setFilters({ ...filters, search: q })} />
        <FilterPanel columns={columns} onChange={setFilters} />
        {selected.size > 0 && (
          <button onClick={handleBulkDelete} className="btn-danger">
            Delete {selected.size}
          </button>
        )}
      </div>
      
      <Table
        columns={columns}
        data={data}
        sortable
        filterable
        selectable
        onSort={setSort}
        onSelect={setSelected}
        selectedIds={selected}
      />
      
      <Pagination
        page={page}
        total={total}
        pageSize={25}
        onChange={setPage}
      />
    </div>
  );
}
```

### Success Criteria
- ✅ Generate sortable tables
- ✅ Create filterable columns
- ✅ Add pagination
- ✅ Include bulk actions
- ✅ Support column visibility toggle

### Dependencies
- Phase 1: Screen type parsing

---

## Phase 8: Component Library & Utilities (Week 4-5)

### Goal
Generate reusable components and utility functions.

### Deliverables
- ✅ Card component generator
- ✅ Button component generator
- ✅ Input component generator
- ✅ Image gallery component
- ✅ Rich text editor component
- ✅ Form utilities
- ✅ Hooks (useForm, useFetch, etc.)

### Success Criteria
- ✅ Generate all UI components
- ✅ Create utility functions
- ✅ Include custom hooks
- ✅ Add TypeScript types
- ✅ Ensure accessibility

### Dependencies
- All previous phases

---

## Phase 9: Styling & Responsive Design (Week 5)

### Goal
Generate Tailwind CSS classes and responsive layouts.

### Deliverables
- ✅ Tailwind class generation
- ✅ Mobile-first responsive design
- ✅ Dark mode support
- ✅ Theme customization
- ✅ Accessibility classes

### Success Criteria
- ✅ Mobile-responsive layouts
- ✅ Dark mode support
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Consistent styling
- ✅ Theme customization

### Dependencies
- All previous phases

---

## Phase 10: Integration & Testing (Week 5-6)

### Goal
Integrate all components and test end-to-end.

### Deliverables
- ✅ Integrated ShepUI compiler
- ✅ End-to-end tests
- ✅ Example output verification
- ✅ Performance benchmarks
- ✅ Documentation

### Success Criteria
- ✅ All phases integrated
- ✅ 100% test coverage
- ✅ Performance acceptable (< 3s for typical spec)
- ✅ Documentation complete
- ✅ Ready for production use

### Dependencies
- All previous phases

---

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Screen Type Parsing | 1 week | Week 1 | Week 1 |
| Phase 2: Feed Generation | 2 weeks | Week 1 | Week 2 |
| Phase 3: Detail Generation | 1 week | Week 2 | Week 2 |
| Phase 4: Wizard Generation | 2 weeks | Week 2 | Week 3 |
| Phase 5: Dashboard Generation | 1 week | Week 3 | Week 3 |
| Phase 6: Inbox Generation | 2 weeks | Week 3 | Week 4 |
| Phase 7: List Generation | 1 week | Week 4 | Week 4 |
| Phase 8: Component Library | 2 weeks | Week 4 | Week 5 |
| Phase 9: Styling & Responsive | 1 week | Week 5 | Week 5 |
| Phase 10: Integration & Testing | 2 weeks | Week 5 | Week 6 |
| **Total** | **6 weeks** | **Week 1** | **Week 6** |

---

## Success Criteria (Overall)

- ✅ Parse all screen types
- ✅ Generate React components
- ✅ Generate form handling
- ✅ Generate real-time updates
- ✅ Generate image galleries
- ✅ Generate rich text editors
- ✅ Generate multi-step wizards
- ✅ Generate dashboards with charts
- ✅ Generate messaging interfaces
- ✅ Generate data tables
- ✅ Mobile-responsive by default
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ 100% test coverage
- ✅ Performance: < 3s for typical spec
- ✅ Documentation complete
- ✅ Ready for production use

---

**Status:** PLAN - Ready for execution
