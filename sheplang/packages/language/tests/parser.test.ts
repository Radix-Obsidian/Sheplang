import { describe, it, expect } from 'vitest';
import { parseShepFile } from '../src/index';

describe('ShepLang Parser - Phase 0 Grammar Tests', () => {
  
  describe('Entity Types', () => {
    it('should parse simple field types', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              name: text
              age: number
              active: yes/no
              email: email
              joinDate: date
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
      expect(result.datas).toHaveLength(1);
      expect(result.datas[0].fields).toHaveLength(5);
    });

    it('should parse advanced field types', () => {
      const spec = `
        app TestApp {
          data Product {
            fields: {
              price: money
              image: image
              description: richtext
              createdAt: datetime
              document: file
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
      expect(result.datas[0].fields).toHaveLength(5);
    });

    it('should parse enum field types', () => {
      const spec = `
        app TestApp {
          data Order {
            fields: {
              status: enum[Pending, Processing, Shipped, Delivered]
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
      expect(result.datas[0].fields[0].type).toContain('enum');
    });

    it('should parse ref field types', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              id: id
            }
          }
          data Post {
            fields: {
              author: ref[User]
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
      expect(result.datas).toHaveLength(2);
    });

    it('should parse array field types', () => {
      const spec = `
        app TestApp {
          data Gallery {
            fields: {
              images: image[]
              tags: text[]
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
      expect(result.datas[0].fields[0].type).toContain('[]');
    });
  });

  describe('Field Constraints', () => {
    it('should parse required constraint', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              email: email required
              name: text required
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
      expect(result.datas[0].fields).toHaveLength(2);
    });

    it('should parse unique constraint', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              email: email unique
              username: text unique
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse optional constraint', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              bio: text optional
              avatar: image optional
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse max constraint', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              name: text max = 100
              bio: text max = 500
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse default constraint', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              status: text default = "active"
              count: number default = 0
              active: yes/no default = true
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse multiple constraints', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              email: email required unique
              name: text required max = 100
              bio: text optional max = 500
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
      expect(result.datas[0].fields).toHaveLength(3);
    });
  });

  describe('Flow Definitions', () => {
    it('should parse basic flow', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              id: id
            }
          }
          flow CreateUser {
            from: UserForm
            trigger: "User clicks Create"
            steps: {
              - "Validate input"
              - "Create user record"
              - "Send confirmation email"
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse flow with integrations', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              id: id
            }
          }
          flow CreateUser {
            from: UserForm
            trigger: "User clicks Create"
            steps: {
              - "Validate input"
              - "Create user record"
            }
            integrations: {
              Stripe: {
                - createCustomer()
              }
              SendGrid: {
                - sendEmail()
              }
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse flow with rules', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              id: id
            }
          }
          flow CreateUser {
            from: UserForm
            trigger: "User clicks Create"
            steps: {
              - "Validate input"
            }
            rules: {
              - "Email must be unique"
              - "Password must be 8+ characters"
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse flow with notifications', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              id: id
            }
          }
          flow CreateUser {
            from: UserForm
            trigger: "User clicks Create"
            steps: {
              - "Create user record"
            }
            notifications: {
              - "Email confirmation to user"
              - "Push notification to admin"
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });
  });

  describe('Screen Definitions', () => {
    it('should parse feed screen', () => {
      const spec = `
        app TestApp {
          data Post {
            fields: {
              id: id
              title: text
            }
          }
          screen Feed {
            kind: "feed"
            entity: Post
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse all screen kinds', () => {
      const kinds = ['feed', 'detail', 'wizard', 'dashboard', 'inbox', 'list'];
      for (const kind of kinds) {
        const spec = `
          app TestApp {
            data Item {
              fields: {
                id: id
              }
            }
            screen TestScreen {
              kind: "${kind}"
            }
          }
        `;
        const result = parseShepFile(spec);
        expect(result).toBeDefined();
      }
    });

    it('should parse screen with layout', () => {
      const spec = `
        app TestApp {
          data Post {
            fields: {
              id: id
            }
          }
          screen Feed {
            kind: "feed"
            entity: Post
            layout: {
              - "Header with title"
              - "List of posts"
              - "Footer with pagination"
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse screen with filters', () => {
      const spec = `
        app TestApp {
          data Post {
            fields: {
              id: id
            }
          }
          screen Feed {
            kind: "feed"
            entity: Post
            filters: {
              - category: text
              - status: enum[Active, Inactive]
              - createdAt: datetime
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse screen with realtime', () => {
      const spec = `
        app TestApp {
          data Post {
            fields: {
              id: id
            }
          }
          screen Feed {
            kind: "feed"
            entity: Post
            realtime: {
              - "New posts appear at top"
              - "Like counts update live"
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse screen with actions', () => {
      const spec = `
        app TestApp {
          data Post {
            fields: {
              id: id
            }
          }
          screen Feed {
            kind: "feed"
            entity: Post
            actions: {
              - Create -> CreatePost
              - Edit -> EditPost
              - Delete -> DeletePost
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });
  });

  describe('Integration Definitions', () => {
    it('should parse basic integration', () => {
      const spec = `
        app TestApp {
          integration Stripe {
            config: {
              - apiKey: "from STRIPE_SECRET_KEY"
            }
            actions: {
              - createPaymentIntent(amount: money, currency: text) -> text
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse integration with multiple actions', () => {
      const spec = `
        app TestApp {
          integration Stripe {
            config: {
              - apiKey: "from STRIPE_SECRET_KEY"
              - publishableKey: "from STRIPE_PUBLISHABLE_KEY"
            }
            actions: {
              - createPaymentIntent(amount: money, currency: text) -> text
              - confirmPayment(paymentIntentId: text) -> yes/no
              - createRefund(chargeId: text, amount: money) -> text
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });

    it('should parse integration with complex parameters', () => {
      const spec = `
        app TestApp {
          integration Elasticsearch {
            config: {
              - node: "from ELASTICSEARCH_URL"
            }
            actions: {
              - search(index: text, query: text, filters: text) -> text
              - index(index: text, document: text) -> text
              - update(index: text, id: text, document: text) -> text
              - delete(index: text, id: text) -> yes/no
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
    });
  });

  describe('Complex Scenarios', () => {
    it('should parse complete app with all features', () => {
      const spec = `
        app Marketplace {
          data User {
            fields: {
              id: id required unique
              email: email required unique
              name: text required max = 100
              avatar: image optional
              status: enum[Active, Inactive] default = "Active"
            }
          }
          
          data Listing {
            fields: {
              id: id required unique
              title: text required
              price: money required
              seller: ref[User] required
              images: image[]
            }
          }
          
          flow CreateListing {
            from: CreateListingForm
            trigger: "User submits form"
            steps: {
              - "Validate input"
              - "Upload images to S3"
              - "Create listing record"
              - "Send confirmation email"
            }
            integrations: {
              S3: {
                - uploadImage(file: file) -> text
              }
              SendGrid: {
                - sendEmail(to: text, template: text) -> yes/no
              }
            }
            rules: {
              - "Price must be greater than 0"
              - "At least one image required"
            }
            notifications: {
              - "Email confirmation to seller"
              - "Push notification to followers"
            }
          }
          
          screen MarketplaceHome {
            kind: "feed"
            entity: Listing
            layout: {
              - "Header with search"
              - "Grid of listings"
              - "Footer with pagination"
            }
            filters: {
              - category: text
              - priceMin: money
              - priceMax: money
            }
            realtime: {
              - "New listings appear at top"
              - "Prices update live"
            }
            actions: {
              - Create -> CreateListing
              - View -> ListingDetail
            }
          }
          
          integration Stripe {
            config: {
              - apiKey: "from STRIPE_SECRET_KEY"
            }
            actions: {
              - createPaymentIntent(amount: money, currency: text) -> text
              - confirmPayment(paymentIntentId: text) -> yes/no
            }
          }
        }
      `;
      const result = parseShepFile(spec);
      expect(result).toBeDefined();
      expect(result.datas).toHaveLength(2);
    });
  });

  describe('Performance', () => {
    it('should parse typical spec in < 100ms', () => {
      const spec = `
        app TestApp {
          data User {
            fields: {
              id: id required unique
              email: email required unique
              name: text required max = 100
            }
          }
          
          flow CreateUser {
            from: UserForm
            trigger: "User clicks Create"
            steps: {
              - "Validate input"
              - "Create user record"
            }
          }
          
          screen UserList {
            kind: "list"
            entity: User
          }
          
          integration SendGrid {
            actions: {
              - sendEmail(to: text, template: text) -> yes/no
            }
          }
        }
      `;
      
      const start = performance.now();
      const result = parseShepFile(spec);
      const end = performance.now();
      
      expect(result).toBeDefined();
      expect(end - start).toBeLessThan(100);
    });
  });
});
