# ShepUI Screen Kinds Specification
**Version:** 1.0 (Draft)  
**Date:** November 21, 2025  
**Status:** SPECIFICATION - Awaiting Review & Approval

---

## Overview

ShepUI generates **real application screens**, not just forms. Each screen "kind" represents a common UI pattern used in production applications.

---

## Screen Kind: Feed (Infinite Scroll)

**Use Case:** Social feeds, activity streams, search results, marketplace listings

**Spec Example:**
```sheplang
screens:
  MarketplaceHome:
    kind: "feed"
    entity: Listing
    layout:
      - "Header with logo, search bar, user menu"
      - "Category navigation bar (horizontal scroll)"
      - "Featured listings carousel (auto-rotating)"
      - "Grid of active listings with infinite scroll"
      - "Each listing card shows: image, title, price, seller avatar, rating"
      - "Filter panel: category, price range, sort options"
      - "Floating action button 'Create Listing' -> Flow 'CreateListing'"
    
    filters:
      - "category: ref[Category], optional"
      - "priceMin: money, optional"
      - "priceMax: money, optional"
      - "sortBy: enum[Recent, PriceLow, PriceHigh, Popular], default=Recent"
    
    realtime:
      - "New listings appear at top"
      - "Favorite count updates live"
      - "Seller status updates live"
    
    pagination:
      - "Load 20 items initially"
      - "Load 10 more on scroll"
      - "Show loading indicator"
```

**Generated Features:**
- ✅ Infinite scroll with loading states
- ✅ Filter panel with real-time updates
- ✅ Optimistic favorite/like updates
- ✅ Real-time new item notifications
- ✅ Search with debouncing
- ✅ Responsive grid (1 col mobile, 2 col tablet, 3+ col desktop)
- ✅ Skeleton loaders while fetching
- ✅ Pull-to-refresh (mobile)

**Generated Code Pattern:**
```typescript
export function MarketplaceHome() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ category: null, priceMin: null, priceMax: null });
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListings({ ...filters, page });
  
  const handleScroll = () => {
    if (isNearBottom) setPage(p => p + 1);
  };
  
  useEffect(() => {
    socket.on('listing:new', (listing) => {
      setListings(prev => [listing, ...prev]);
    });
  }, []);
  
  return (
    <div onScroll={handleScroll}>
      <SearchBar />
      <CategoryNav />
      <FilterPanel onChange={setFilters} />
      <Grid>
        {listings.map(l => <ListingCard key={l.id} listing={l} />)}
      </Grid>
    </div>
  );
}
```

---

## Screen Kind: Detail (Single Item)

**Use Case:** Product pages, article pages, profile pages, order details

**Spec Example:**
```sheplang
screens:
  ListingDetail:
    kind: "detail"
    entity: Listing
    layout:
      - "Image gallery with zoom and fullscreen"
      - "Title, price, and seller info"
      - "Rich text description with formatting"
      - "Action buttons: 'Buy Now', 'Favorite', 'Share'"
      - "Button 'Contact Seller' -> Flow 'SendMessage'"
      - "Related listings section (carousel)"
      - "Review and rating section"
      - "Breadcrumb navigation"
    
    sidebar:
      - "Seller card with avatar, name, rating, response time"
      - "Shipping info"
      - "Return policy"
      - "Safety tips"
    
    realtime:
      - "View count updates"
      - "Favorite count updates"
      - "New reviews appear"
      - "Seller status updates"
    
    actions:
      - "Buy Now" -> Flow 'PurchaseListing'
      - "Favorite" -> Flow 'FavoriteListing'
      - "Share" -> Flow 'ShareListing'
      - "Contact Seller" -> Flow 'SendMessage'
      - "Report" -> Flow 'ReportListing'
```

**Generated Features:**
- ✅ Image gallery with zoom, fullscreen, thumbnails
- ✅ Lazy-loaded related items
- ✅ Optimistic favorite/like updates
- ✅ Real-time view count
- ✅ Sticky action buttons (mobile)
- ✅ Breadcrumb navigation
- ✅ Share buttons (social media, copy link)
- ✅ Review section with pagination
- ✅ Responsive layout (single column mobile, two column desktop)

**Generated Code Pattern:**
```typescript
export function ListingDetail({ listingId }: Props) {
  const { data: listing, isLoading } = useListing(listingId);
  const { mutate: favorite } = useFavoriteListing();
  const [imageIndex, setImageIndex] = useState(0);
  
  useEffect(() => {
    trackView(listingId);
    socket.on('listing:updated', (updated) => {
      setListing(updated);
    });
  }, [listingId]);
  
  const handleFavorite = () => {
    favorite(listingId, {
      optimisticData: {
        ...listing,
        favorites: [...listing.favorites, currentUser.id]
      }
    });
  };
  
  return (
    <div>
      <Breadcrumb />
      <ImageGallery images={listing.images} />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <h1>{listing.title}</h1>
          <RichText content={listing.description} />
          <RelatedListings category={listing.category} />
        </div>
        <div className="col-span-1 sticky top-0">
          <PriceCard price={listing.price} onBuyNow={...} />
          <SellerCard seller={listing.seller} />
        </div>
      </div>
    </div>
  );
}
```

---

## Screen Kind: Wizard (Multi-Step Form)

**Use Case:** Onboarding, checkout, complex forms, account setup

**Spec Example:**
```sheplang
screens:
  CreateListing:
    kind: "wizard"
    entity: Listing
    steps:
      - name: "Basic Info"
        description: "Tell us about your item"
        fields:
          - "Field 'title' with character count (max 100)"
          - "Select 'category' with icons and search"
          - "Rich text editor 'description' (max 5000 chars)"
        validation:
          - "title is required"
          - "category is required"
      
      - name: "Pricing"
        description: "Set your price"
        fields:
          - "Currency input 'price' with validation (min $1)"
          - "Toggle 'acceptOffers' with conditional reveal"
          - "Field 'minimumOffer' if acceptOffers=true"
        validation:
          - "price is required and > $1"
          - "minimumOffer < price if acceptOffers=true"
      
      - name: "Images"
        description: "Upload photos"
        fields:
          - "Image uploader with drag-drop, preview, reorder"
          - "Max 10 images, first is cover"
          - "Auto-optimization and thumbnail generation"
        validation:
          - "At least 1 image required"
          - "Max 10 images"
      
      - name: "Review"
        description: "Review your listing"
        preview: true
        submit: "Publish Listing" -> Flow 'PublishListing'
    
    progress:
      - "Show step indicator (1/4, 2/4, etc.)"
      - "Show progress bar"
      - "Allow back/next navigation"
      - "Save draft on each step"
```

**Generated Features:**
- ✅ Multi-step form with progress indicator
- ✅ Step validation before proceeding
- ✅ Draft saving on each step
- ✅ Back/next navigation
- ✅ Conditional field reveal (if/else)
- ✅ Rich text editor
- ✅ Image uploader with drag-drop
- ✅ File compression before upload
- ✅ Inline validation messages
- ✅ Mobile-optimized (one step per screen)
- ✅ Desktop (sidebar with steps)

**Generated Code Pattern:**
```typescript
export function CreateListing() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const steps = [
    { name: 'Basic Info', validate: validateBasicInfo },
    { name: 'Pricing', validate: validatePricing },
    { name: 'Images', validate: validateImages },
    { name: 'Review', validate: () => true }
  ];
  
  const handleNext = async () => {
    const validation = steps[step].validate(formData);
    if (validation.ok) {
      saveDraft(formData);
      setStep(s => s + 1);
    } else {
      setErrors(validation.errors);
    }
  };
  
  return (
    <div className="grid grid-cols-4 gap-8">
      <StepSidebar steps={steps} currentStep={step} />
      <div className="col-span-3">
        {step === 0 && <BasicInfoStep data={formData} onChange={setFormData} />}
        {step === 1 && <PricingStep data={formData} onChange={setFormData} />}
        {step === 2 && <ImagesStep data={formData} onChange={setFormData} />}
        {step === 3 && <ReviewStep data={formData} onSubmit={publishListing} />}
        <div className="flex gap-4 mt-8">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}>Back</button>
          <button onClick={handleNext} disabled={step === steps.length - 1}>Next</button>
        </div>
      </div>
    </div>
  );
}
```

---

## Screen Kind: Dashboard (Analytics & Overview)

**Use Case:** Admin panels, seller dashboards, analytics, KPI tracking

**Spec Example:**
```sheplang
screens:
  SellerDashboard:
    kind: "dashboard"
    layout:
      - "Header with date range picker"
      - "Stats cards: Total sales, Active listings, Messages, Revenue"
      - "Revenue chart (line graph, last 30 days)"
      - "Recent purchases table (sortable, paginated)"
      - "Top listings by views (bar chart)"
      - "Quick actions: Create listing, View messages"
      - "Notifications feed (latest 5)"
    
    stats:
      - "totalSales: sum of Purchase.amount"
      - "activeListings: count of Listing where status=Active"
      - "pendingMessages: count of Message where read=false"
      - "revenue: sum of Purchase.amount where status=Completed"
    
    charts:
      - "revenueChart: line graph of daily revenue"
      - "topListings: bar chart of views by listing"
      - "purchasesByCategory: pie chart"
    
    tables:
      - "recentPurchases: sortable, paginated, clickable rows"
      - "activeListings: with status badges, quick actions"
    
    realtime:
      - "Stats update every 5 minutes"
      - "New purchases appear in table"
      - "Revenue chart updates"
```

**Generated Features:**
- ✅ Responsive grid layout
- ✅ Stats cards with icons and trends
- ✅ Line/bar/pie charts (Chart.js integration)
- ✅ Sortable tables with pagination
- ✅ Date range picker
- ✅ Real-time stat updates
- ✅ Drill-down to detail pages
- ✅ Export to CSV
- ✅ Mobile-responsive (stacked layout)

---

## Screen Kind: Inbox (Messaging)

**Use Case:** Direct messaging, notifications, support tickets, conversations

**Spec Example:**
```sheplang
screens:
  Messages:
    kind: "inbox"
    entity: Message
    layout:
      - "Two-column: conversation list | active thread"
      - "Search conversations"
      - "Conversation list with avatars, names, preview, timestamp"
      - "Active thread with message history"
      - "Message composer with file attachments"
      - "Typing indicators"
      - "Read receipts"
      - "Unread badge on conversations"
    
    features:
      - "Real-time message delivery via WebSocket"
      - "Optimistic message sending"
      - "Typing indicators"
      - "Read receipts"
      - "File attachments (images, documents)"
      - "Message search within conversation"
      - "Conversation search"
      - "Archive/mute conversations"
      - "Notification for new messages"
    
    realtime:
      - "New messages appear instantly"
      - "Typing indicators show in real-time"
      - "Read receipts update"
      - "Conversation list updates with latest message"
```

**Generated Features:**
- ✅ Two-column layout (mobile: single column with tabs)
- ✅ Real-time message sync via WebSocket
- ✅ Optimistic message sending
- ✅ Typing indicators
- ✅ Read receipts
- ✅ File upload in messages
- ✅ Message search
- ✅ Conversation search
- ✅ Archive/mute functionality
- ✅ Notification badges
- ✅ Mobile-optimized (tabs for list/thread)

---

## Screen Kind: List (Table View)

**Use Case:** Admin tables, data management, inventory, content management

**Spec Example:**
```sheplang
screens:
  MenuItemsAdmin:
    kind: "list"
    entity: MenuItem
    layout:
      - "Search bar with debouncing"
      - "Filter panel: category, status, date range"
      - "Sortable table: name, category, status, created date"
      - "Bulk actions: delete, archive, export"
      - "Row actions: edit, delete, view"
      - "Pagination: 25, 50, 100 items per page"
      - "Add button 'New Item' -> Flow 'CreateMenuItem'"
    
    columns:
      - "name: text, sortable"
      - "category: ref[Category], filterable"
      - "status: enum, filterable"
      - "createdAt: datetime, sortable"
      - "actions: edit, delete, view"
    
    features:
      - "Multi-select with bulk actions"
      - "Column visibility toggle"
      - "Export to CSV"
      - "Inline editing (optional)"
      - "Row expansion for details"
```

**Generated Features:**
- ✅ Sortable columns
- ✅ Filterable columns
- ✅ Search with debouncing
- ✅ Pagination with configurable page size
- ✅ Bulk actions (select multiple rows)
- ✅ Row actions (edit, delete, view)
- ✅ Column visibility toggle
- ✅ Export to CSV
- ✅ Responsive (horizontal scroll on mobile)
- ✅ Inline editing (optional)

---

## Summary Table

| Kind | Use Case | Key Features |
|------|----------|--------------|
| **Feed** | Social, search, listings | Infinite scroll, filters, real-time |
| **Detail** | Product pages, profiles | Image gallery, rich content, related items |
| **Wizard** | Onboarding, checkout | Multi-step, validation, draft saving |
| **Dashboard** | Analytics, KPIs | Charts, stats, real-time updates |
| **Inbox** | Messaging, notifications | Real-time sync, typing indicators, search |
| **List** | Admin, data management | Sorting, filtering, bulk actions, export |

---

**Status:** DRAFT - Awaiting review and approval
