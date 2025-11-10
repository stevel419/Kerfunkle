# Kerfunkle E-Commerce Migration Scope
## Node.js/Express/MongoDB → Ruby on Rails

**Project Directory:** `/home/stevelin419/Projects/Kerfunkle-Rails/`  
**Original App:** `/home/stevelin419/Projects/Dropshipping-Project/Kerfunkle/`  
**Timeline:** 4-6 weeks  
**Budget:** $5/month (Heroku Eco Dyno)

---

## 🎯 Project Overview

Migrating a dropshipping e-commerce application from Node.js/Express/MongoDB stack to a modern Ruby on Rails application with industry-standard practices, budget-conscious architecture, and stylistic upgrades inspired by contemporary e-commerce sites.

### Current Application Analysis

**Existing Stack:**
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Auth**: JWT with email-based one-time codes (passwordless)
- **Payment**: Stripe Checkout (embedded UI mode)
- **Email**: Nodemailer with Gmail SMTP
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize
- **Logging**: Winston

**Current Features:**
- Passwordless authentication (6-digit email codes)
- Shopping cart with persistence
- Product catalog (4 party/lighting products)
- Stripe payment integration
- User management
- Email notifications
- Rate limiting & security middleware

**Identified Models:**
1. **User**: email, verification code, code expiration, login attempts, timestamps
2. **Cart**: user association, items array with product details

---

## 🏗️ New Technology Stack

### Backend Framework
- **Ruby on Rails 7.1+** (latest stable)
- **Ruby 3.2+**
- **Puma** web server

### Database
- **PostgreSQL** (Heroku free tier)
  - Replacing MongoDB for ACID compliance
  - Better relational data modeling
  - Industry standard for Rails apps

### Frontend Stack
- **Hotwire** (Rails-native SPA alternative)
  - **Turbo Drive**: Fast page navigation
  - **Turbo Frames**: Partial page updates without full reload
  - **Turbo Streams**: Real-time updates over WebSockets
  - **Stimulus.js**: Lightweight JavaScript controllers
- **Tailwind CSS 3**: Utility-first styling framework
- **ViewComponent**: Reusable, testable view components
- **ImportMap**: No build step required (Rails 7 default)

### Authentication & Security
- **Custom Passwordless Authentication**
  - Email-based 6-digit verification codes
  - Cookie-based sessions (no JWT, more secure)
  - Rate limiting with Rack::Attack
- **Built-in Rails Security**
  - Strong Parameters
  - CSRF protection
  - SQL injection prevention (ActiveRecord)
  - XSS protection (ERB auto-escaping)
- **Security Gems**
  - `rack-attack` - Rate limiting & throttling
  - `secure_headers` - Security headers (CSP, HSTS, etc.)
  - `brakeman` - Static security analysis

### Payment Processing
- **Stripe Ruby SDK**
- Embedded Checkout (same as current)
- Webhook handling for order confirmation

### Email System
- **ActionMailer** (Rails built-in)
  - SMTP configuration (Gmail for development and production)
  - Direct SMTP delivery (no third-party service)
  - Background delivery with job queue
- **Email Templates**
  - Responsive HTML email layouts
  - Inline CSS for email client compatibility

### Background Jobs
- **GoodJob** (Postgres-backed, no Redis required)
  - Asynchronous email delivery
  - Future scalability for order processing
  - Built-in web UI for job monitoring

### Admin Dashboard
- **Avo 3.0** or **Custom Admin Panel**
  - Product management (CRUD)
  - Order management & status updates
  - User overview
  - Sales analytics

### Testing Framework
- **RSpec** - Behavior-driven testing
- **FactoryBot** - Test fixtures
- **Capybara** - Integration/system tests
- **Faker** - Test data generation

### Development Tools
- **Rubocop** - Code linting
- **Bullet** - N+1 query detection
- **Better Errors** - Enhanced error pages
- **Annotate** - Schema annotations in models

---

## 📊 Database Schema Design

### Migration from MongoDB to PostgreSQL

**Key Changes:**
- Document-based → Relational tables
- Embedded documents → Foreign keys & associations
- Flexible schema → Strict schema with migrations
- Products moved from hardcoded → database storage

### Complete Schema

#### Users Table
```ruby
create_table :users do |t|
  t.string :email, null: false
  t.string :verification_code
  t.datetime :code_expires_at
  t.integer :login_attempts, default: 0
  t.datetime :last_login_at
  t.timestamps
  
  t.index :email, unique: true
end
```

**Validations:**
- Email format validation
- Uniqueness of email (case-insensitive)
- Code expiration logic

#### Products Table
```ruby
create_table :products do |t|
  t.string :name, null: false
  t.text :description
  t.decimal :price, precision: 10, scale: 2, null: false
  t.string :stripe_price_id
  t.string :product_number, null: false
  t.string :image_url
  t.text :features, array: true, default: []  # PostgreSQL array
  t.boolean :active, default: true
  t.integer :position, default: 0
  t.string :category  # "LED Lights", "Disco Balls", "Fog Machines", "Accessories"
  t.timestamps
  
  t.index :product_number, unique: true
  t.index :category
  t.index :active
end
```

**Initial Products (from current app):**
1. 100ft RGB LED Strip Lights - $12.99
2. Disco Ball with Remote - $15.99
3. Fog Machine 500W - $34.99
4. Fog Machine Liquid 32oz - $19.99

#### Carts Table
```ruby
create_table :carts do |t|
  t.references :user, foreign_key: true, index: true
  t.timestamps
end
```

#### Cart Items Table (Normalized)
```ruby
create_table :cart_items do |t|
  t.references :cart, null: false, foreign_key: true
  t.references :product, null: false, foreign_key: true
  t.integer :quantity, default: 1, null: false
  t.timestamps
  
  t.index [:cart_id, :product_id], unique: true
end
```

**Key Improvement:** Normalized structure vs. embedded array in MongoDB

#### Orders Table
```ruby
create_table :orders do |t|
  t.references :user, null: false, foreign_key: true
  t.string :stripe_checkout_session_id, index: true
  t.string :stripe_payment_intent_id
  t.string :status, default: 'pending'
  # Status flow: pending → processing → paid → shipped → completed
  t.decimal :total_amount, precision: 10, scale: 2
  t.string :customer_email
  t.jsonb :shipping_address, default: {}
  t.jsonb :billing_address, default: {}
  t.datetime :paid_at
  t.datetime :shipped_at
  t.timestamps
  
  t.index :status
  t.index :stripe_checkout_session_id, unique: true
end
```

#### Order Items Table
```ruby
create_table :order_items do |t|
  t.references :order, null: false, foreign_key: true
  t.references :product, null: false, foreign_key: true
  t.integer :quantity, null: false
  t.decimal :price_at_purchase, precision: 10, scale: 2, null: false
  t.string :product_name  # Snapshot in case product is deleted/modified
  t.string :product_image_url  # Snapshot
  t.timestamps
end
```

**Data Integrity:** Product snapshots ensure order history remains accurate

---

## 🎨 Design System & UI

### Design Inspiration Sources

#### Primary: [Droppiez.com](https://droppiez.com/)
- Bold, high-contrast color schemes (black/white base)
- Sale percentage badges on product cards
- Modern, clean product card layouts
- Dropdown navigation menus
- "Quick View" product interactions
- Strong typography hierarchy
- Mobile-first responsive design

#### Secondary: [Dumbclub.com](https://www.dumbclub.com/)
- Minimalist, modern approach
- Strong brand voice and personality
- Full-width hero sections with impact
- Clean, simple footer design
- Gen Z aesthetic: bold, authentic, direct
- Engaging copy and messaging

### Color Palette

```css
/* Primary Colors */
--color-primary: #000000;        /* Black - main brand color */
--color-secondary: #FFFFFF;      /* White - clean backgrounds */
--color-accent: #FF6B6B;         /* Bold Red - CTAs, alerts */
--color-highlight: #4ECDC4;      /* Teal - secondary actions */

/* Party Theme (Kerfunkle Brand) */
--color-party-purple: #9333EA;   /* Purple lights */
--color-party-blue: #3B82F6;     /* Blue disco */
--color-party-pink: #EC4899;     /* Pink neon */
--color-party-yellow: #FBBF24;   /* Yellow glow */

/* Neutrals (Tailwind-inspired) */
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;

/* Semantic Colors */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;
```

### Typography

```css
/* Font Stack */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Poppins', 'Inter', sans-serif;

/* Font Sizes (Tailwind scale) */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
--text-7xl: 4.5rem;      /* 72px */
--text-8xl: 6rem;        /* 96px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;
```

### Spacing & Layout

```css
/* Container Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Spacing Scale (Tailwind) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */

/* Border Radius */
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Full rounded */
```

### Key UI Components

#### 1. Navigation Bar
- Fixed header with transparent-to-solid scroll effect
- Logo (left), Navigation links (center), Account/Cart (right)
- Mobile: Hamburger menu with slide-out drawer
- Dropdowns for account actions (logout)
- Cart icon with item count badge

#### 2. Hero Section
- Full viewport height
- Dynamic background images with overlay
- Bold headline typography
- Prominent CTA button
- Scroll indicator animation
- Auto-playing carousel option

#### 3. Product Cards
- Aspect ratio locked (1:1 square images)
- Hover effects: scale image, show quick actions
- Product name (2-line clamp)
- Price (bold, large)
- "Add to Cart" button
- Optional: Sale badge, stock indicator

#### 4. Product Detail Page
- Large image gallery with thumbnails
- Product name, price, description
- Quantity selector
- "Add to Cart" CTA
- Product features list
- Related products section

#### 5. Shopping Cart
- Line items with image, name, price, quantity
- Quantity adjustment (+ / - buttons)
- Remove item option
- Subtotal, shipping estimate, total
- "Continue Shopping" + "Checkout" buttons
- Empty cart state with CTA

#### 6. Checkout Flow
- Stripe embedded checkout (existing flow)
- Progress indicator (optional)
- Order confirmation page with details

#### 7. Order History
- List of past orders with status
- Order details: items, total, date, shipping address
- Track order status (pending → paid → shipped → completed)

#### 8. Footer
- Logo and brand tagline
- Navigation links (Shop, About, Policies)
- Legal links (Privacy, Terms, Refund Policy)
- Social proof / trust badges
- Copyright notice

### Animation & Interactions

**Turbo Page Transitions:**
- Smooth fade-in on navigation
- Preserve scroll position where appropriate

**Micro-interactions:**
- Button hover states (scale, color change)
- Card hover effects (lift, shadow)
- Loading states (spinner, skeleton screens)
- Success/error toast notifications

**Scroll Animations:**
- Fade-in on scroll (optional, use Stimulus)
- Parallax effects on hero section

---

## 🏛️ Application Architecture

### Directory Structure

```
kerfunkle-rails/
├── app/
│   ├── controllers/
│   │   ├── admin/
│   │   │   ├── base_controller.rb
│   │   │   ├── dashboard_controller.rb
│   │   │   ├── products_controller.rb
│   │   │   └── orders_controller.rb
│   │   ├── application_controller.rb
│   │   ├── sessions_controller.rb
│   │   ├── pages_controller.rb
│   │   ├── products_controller.rb
│   │   ├── cart_controller.rb
│   │   ├── cart_items_controller.rb
│   │   ├── checkout_controller.rb
│   │   ├── orders_controller.rb
│   │   └── webhooks_controller.rb
│   ├── models/
│   │   ├── user.rb
│   │   ├── product.rb
│   │   ├── cart.rb
│   │   ├── cart_item.rb
│   │   ├── order.rb
│   │   └── order_item.rb
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── application.html.erb
│   │   │   ├── admin.html.erb
│   │   │   └── mailer.html.erb
│   │   ├── pages/
│   │   │   ├── home.html.erb
│   │   │   └── about.html.erb
│   │   ├── sessions/
│   │   │   ├── new.html.erb          # Email input
│   │   │   └── verify.html.erb       # Code verification
│   │   ├── products/
│   │   │   ├── index.html.erb        # Shop page
│   │   │   └── show.html.erb         # Product detail
│   │   ├── cart/
│   │   │   └── show.html.erb         # Cart page
│   │   ├── checkout/
│   │   │   ├── new.html.erb          # Checkout form
│   │   │   └── success.html.erb      # Order confirmation
│   │   ├── orders/
│   │   │   ├── index.html.erb        # Order history
│   │   │   └── show.html.erb         # Order details
│   │   └── user_mailer/
│   │       ├── verification_code.html.erb
│   │       └── order_confirmation.html.erb
│   ├── components/                    # ViewComponents
│   │   ├── navbar_component.rb
│   │   ├── footer_component.rb
│   │   ├── product_card_component.rb
│   │   ├── cart_item_component.rb
│   │   └── hero_component.rb
│   ├── javascript/
│   │   ├── controllers/               # Stimulus controllers
│   │   │   ├── cart_controller.js
│   │   │   ├── checkout_controller.js
│   │   │   ├── carousel_controller.js
│   │   │   ├── dropdown_controller.js
│   │   │   └── notification_controller.js
│   │   └── application.js
│   ├── services/                      # Business logic
│   │   ├── authentication_service.rb
│   │   ├── cart_service.rb
│   │   ├── checkout_service.rb
│   │   └── order_service.rb
│   ├── mailers/
│   │   └── user_mailer.rb
│   └── jobs/
│       ├── send_verification_email_job.rb
│       └── send_order_confirmation_job.rb
├── config/
│   ├── routes.rb
│   ├── database.yml
│   ├── credentials.yml.enc
│   ├── environments/
│   ├── initializers/
│   │   ├── stripe.rb
│   │   ├── good_job.rb
│   │   └── rack_attack.rb
│   └── tailwind.config.js
├── db/
│   ├── migrate/
│   ├── seeds.rb
│   └── schema.rb
├── spec/                              # RSpec tests
│   ├── models/
│   ├── requests/
│   ├── system/
│   └── factories/
├── public/
│   └── assets/
├── Gemfile
├── Procfile                           # Heroku config
├── README.md
└── scope.md                           # This file
```

### MVC Pattern Implementation

#### Models (Business Logic)

**User Model** (`app/models/user.rb`):
```ruby
class User < ApplicationRecord
  has_one :cart, dependent: :destroy
  has_many :orders, dependent: :destroy
  
  validates :email, presence: true, 
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  
  before_save :downcase_email
  after_create :create_cart
  
  def generate_verification_code
    self.verification_code = SecureRandom.random_number(1_000_000).to_s.rjust(6, '0')
    self.code_expires_at = 15.minutes.from_now
    save
  end
  
  def verify_code(code)
    return false if login_attempts >= 5
    increment!(:login_attempts)
    
    if verification_code == code && code_expires_at > Time.current
      update(login_attempts: 0, last_login_at: Time.current)
      true
    else
      false
    end
  end
  
  private
  
  def downcase_email
    self.email = email.downcase.strip
  end
end
```

**Product Model** (`app/models/product.rb`):
```ruby
class Product < ApplicationRecord
  has_many :cart_items, dependent: :destroy
  has_many :order_items, dependent: :restrict_with_error
  
  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :product_number, presence: true, uniqueness: true
  
  scope :active, -> { where(active: true) }
  scope :by_category, ->(category) { where(category: category) }
  scope :ordered_by_position, -> { order(:position) }
  
  def formatted_price
    "$#{price}"
  end
end
```

**Cart Model** (`app/models/cart.rb`):
```ruby
class Cart < ApplicationRecord
  belongs_to :user
  has_many :cart_items, dependent: :destroy
  has_many :products, through: :cart_items
  
  def add_product(product, quantity = 1)
    cart_item = cart_items.find_by(product: product)
    
    if cart_item
      cart_item.increment!(:quantity, quantity)
    else
      cart_items.create(product: product, quantity: quantity)
    end
  end
  
  def total_price
    cart_items.includes(:product).sum { |item| item.product.price * item.quantity }
  end
  
  def total_items
    cart_items.sum(:quantity)
  end
  
  def clear!
    cart_items.destroy_all
  end
end
```

**Order Model** (`app/models/order.rb`):
```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy
  
  enum status: {
    pending: 'pending',
    processing: 'processing',
    paid: 'paid',
    shipped: 'shipped',
    completed: 'completed',
    cancelled: 'cancelled'
  }
  
  def self.create_from_stripe_session(user, stripe_session)
    transaction do
      order = create!(
        user: user,
        stripe_checkout_session_id: stripe_session.id,
        stripe_payment_intent_id: stripe_session.payment_intent,
        status: 'paid',
        total_amount: stripe_session.amount_total / 100.0,
        customer_email: stripe_session.customer_details.email,
        shipping_address: stripe_session.shipping_details&.address || {},
        billing_address: stripe_session.customer_details&.address || {},
        paid_at: Time.current
      )
      
      # Create order items from cart
      user.cart.cart_items.each do |cart_item|
        order.order_items.create!(
          product: cart_item.product,
          quantity: cart_item.quantity,
          price_at_purchase: cart_item.product.price,
          product_name: cart_item.product.name,
          product_image_url: cart_item.product.image_url
        )
      end
      
      order
    end
  end
end
```

#### Controllers (Request Handling)

**Sessions Controller** (`app/controllers/sessions_controller.rb`):
```ruby
class SessionsController < ApplicationController
  skip_before_action :require_login, only: [:new, :create, :verify, :verify_code]
  
  def new
    # Email input form
  end
  
  def create
    user = User.find_or_create_by(email: params[:email].downcase.strip)
    user.generate_verification_code
    
    SendVerificationEmailJob.perform_later(user.id)
    
    session[:pending_email] = user.email
    redirect_to verify_sessions_path, notice: "Verification code sent to #{user.email}"
  end
  
  def verify
    # Code verification form
  end
  
  def verify_code
    user = User.find_by(email: session[:pending_email])
    
    if user&.verify_code(params[:code])
      session[:user_id] = user.id
      session.delete(:pending_email)
      redirect_to root_path, notice: "Welcome back!"
    else
      flash.now[:alert] = "Invalid or expired code"
      render :verify, status: :unprocessable_entity
    end
  end
  
  def destroy
    session.delete(:user_id)
    redirect_to root_path, notice: "Logged out successfully"
  end
end
```

**Cart Controller** (`app/controllers/cart_controller.rb`):
```ruby
class CartController < ApplicationController
  before_action :require_login
  
  def show
    @cart = current_user.cart
  end
end
```

**Cart Items Controller** (`app/controllers/cart_items_controller.rb`):
```ruby
class CartItemsController < ApplicationController
  before_action :require_login
  
  def create
    product = Product.find(params[:product_id])
    current_user.cart.add_product(product, params[:quantity].to_i || 1)
    
    respond_to do |format|
      format.html { redirect_to cart_path, notice: "#{product.name} added to cart" }
      format.turbo_stream
    end
  end
  
  def update
    cart_item = current_user.cart.cart_items.find(params[:id])
    cart_item.update(quantity: params[:quantity])
    
    respond_to do |format|
      format.html { redirect_to cart_path }
      format.turbo_stream
    end
  end
  
  def destroy
    cart_item = current_user.cart.cart_items.find(params[:id])
    cart_item.destroy
    
    respond_to do |format|
      format.html { redirect_to cart_path, notice: "Item removed" }
      format.turbo_stream
    end
  end
end
```

**Checkout Controller** (`app/controllers/checkout_controller.rb`):
```ruby
class CheckoutController < ApplicationController
  before_action :require_login
  
  def new
    @cart = current_user.cart
    
    if @cart.cart_items.empty?
      redirect_to cart_path, alert: "Your cart is empty"
    end
  end
  
  def create
    cart = current_user.cart
    
    line_items = cart.cart_items.map do |item|
      {
        price: item.product.stripe_price_id,
        quantity: item.quantity
      }
    end
    
    session = Stripe::Checkout::Session.create(
      ui_mode: 'embedded',
      line_items: line_items,
      mode: 'payment',
      return_url: checkout_success_url + '?session_id={CHECKOUT_SESSION_ID}',
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX', 'AU', 'GB', 'DE', 'FR', 'IT', 'JP', 'SG', 'KR', 'BR', 'NL', 'NZ']
      }
    )
    
    render json: { clientSecret: session.client_secret }
  end
  
  def success
    stripe_session = Stripe::Checkout::Session.retrieve(params[:session_id])
    
    order = Order.create_from_stripe_session(current_user, stripe_session)
    current_user.cart.clear!
    
    redirect_to order_path(order)
  end
end
```

#### Services (Business Logic Extraction)

**Authentication Service** (`app/services/authentication_service.rb`):
```ruby
class AuthenticationService
  def self.send_verification_code(email)
    user = User.find_or_create_by(email: email.downcase.strip)
    user.generate_verification_code
    
    UserMailer.verification_code(user).deliver_later
    
    user
  end
  
  def self.verify_code(email, code)
    user = User.find_by(email: email.downcase.strip)
    return nil unless user
    
    user.verify_code(code) ? user : nil
  end
end
```

---

## 📧 Email System with ActionMailer

### Overview

The application uses **ActionMailer** (Rails built-in email framework) with **Gmail SMTP** for both development and production environments. This eliminates the need for third-party email services and keeps costs at $0/month for email delivery.

**Key Benefits:**
- No additional services or API keys to manage
- Free tier provides 500 emails/day (sufficient for small-medium traffic)
- Simple, consistent configuration across environments
- Direct SMTP delivery with reliable Gmail infrastructure

### Configuration

**Development (Gmail SMTP):**
```ruby
# config/environments/development.rb
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: 'smtp.gmail.com',
  port: 587,
  domain: 'kerfunkle.com',
  user_name: ENV['EMAIL_USER'],
  password: ENV['EMAIL_PASS'],
  authentication: 'plain',
  enable_starttls_auto: true
}
config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
```

**Production (Gmail SMTP):**
```ruby
# config/environments/production.rb
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: 'smtp.gmail.com',
  port: 587,
  domain: ENV['EMAIL_DOMAIN'] || 'kerfunkle.com',
  user_name: ENV['EMAIL_USER'],
  password: ENV['EMAIL_PASS'],  # Use App Password for Gmail
  authentication: 'plain',
  enable_starttls_auto: true
}
config.action_mailer.default_url_options = { host: ENV['APP_DOMAIN'] }
config.action_mailer.perform_deliveries = true
config.action_mailer.raise_delivery_errors = true
```

**Important Gmail SMTP Notes:**
- **App Passwords**: Use Gmail App Passwords instead of your regular password for security
  - Enable 2FA on your Gmail account
  - Generate App Password at: https://myaccount.google.com/apppasswords
  - Use the 16-character app password in `EMAIL_PASS` environment variable
- **Sending Limits**: 
  - Free Gmail: 500 emails/day (more than sufficient for this use case)
  - G Suite/Workspace: 2000 emails/day
- **From Address**: Must match or be authorized by the Gmail account
- **Best Practices**:
  - Use a dedicated email account for the application (e.g., noreply@kerfunkle.com via Gmail)
  - Monitor bounce rates and delivery issues
  - Consider alternative SMTP providers if scaling beyond 500 emails/day (Mailgun, Postmark, etc.)

### Mailer Implementation

**User Mailer** (`app/mailers/user_mailer.rb`):
```ruby
class UserMailer < ApplicationMailer
  default from: 'Kerfunkle <no-reply@kerfunkle.com>'
  
  def verification_code(user)
    @user = user
    @code = user.verification_code
    
    mail(
      to: @user.email,
      subject: "#{@code} is your Kerfunkle login code"
    )
  end
  
  def order_confirmation(order)
    @order = order
    @user = order.user
    
    mail(
      to: @user.email,
      subject: "Order Confirmation ##{order.id} - Kerfunkle"
    )
  end
end
```

**Verification Email Template** (`app/views/user_mailer/verification_code.html.erb`):
```erb
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .code { font-size: 32px; font-weight: bold; color: #9333EA; text-align: center; padding: 20px; background: #F3F4F6; border-radius: 8px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 14px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your Kerfunkle Login Code</h2>
    
    <p>Hi there,</p>
    
    <p>Use this code to log in to your Kerfunkle account:</p>
    
    <div class="code"><%= @code %></div>
    
    <p><strong>This code expires in 15 minutes</strong> and can only be used once.</p>
    
    <p>If you didn't request this code, you can safely ignore this email.</p>
    
    <div class="footer">
      <p>Thanks,<br>The Kerfunkle Team</p>
    </div>
  </div>
</body>
</html>
```

**Text Version** (`app/views/user_mailer/verification_code.text.erb`):
```
Your Kerfunkle Login Code

Hi there,

Use this code to log in to your Kerfunkle account:

<%= @code %>

This code expires in 15 minutes and can only be used once.

If you didn't request this code, you can safely ignore this email.

Thanks,
The Kerfunkle Team
```

### Background Job Processing

**Send Verification Email Job** (`app/jobs/send_verification_email_job.rb`):
```ruby
class SendVerificationEmailJob < ApplicationJob
  queue_as :default
  
  def perform(user_id)
    user = User.find(user_id)
    UserMailer.verification_code(user).deliver_now
  end
end
```

**GoodJob Configuration** (`config/initializers/good_job.rb`):
```ruby
Rails.application.configure do
  config.good_job.execution_mode = :async
  config.good_job.max_threads = 5
  config.good_job.poll_interval = 30 # seconds
  config.good_job.enable_cron = true
  
  # Retry configuration
  config.good_job.retry_on_unhandled_error = false
  config.good_job.on_thread_error = ->(exception) { Rails.logger.error(exception) }
end
```

---

## 🔒 Security Implementation

### Rate Limiting with Rack::Attack

**Configuration** (`config/initializers/rack_attack.rb`):
```ruby
class Rack::Attack
  # Throttle login attempts
  throttle('logins/email', limit: 5, period: 1.hour) do |req|
    if req.path == '/sessions' && req.post?
      req.ip
    end
  end
  
  # Throttle verification code attempts
  throttle('verify/ip', limit: 10, period: 1.hour) do |req|
    if req.path == '/sessions/verify' && req.post?
      req.ip
    end
  end
  
  # Throttle API requests
  throttle('api/ip', limit: 100, period: 15.minutes) do |req|
    req.ip if req.path.start_with?('/api')
  end
  
  # Block suspicious requests
  blocklist('block suspicious ips') do |req|
    # Block IPs from config or database
    Rack::Attack::Allow2Ban.filter(req.ip, maxretry: 20, findtime: 1.minute, bantime: 1.hour) do
      req.path == '/sessions/verify' && req.post?
    end
  end
end
```

### Content Security Policy

**Configuration** (`config/initializers/content_security_policy.rb`):
```ruby
Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :data
    policy.img_src     :self, :data, :https, 'https://m.media-amazon.com'
    policy.object_src  :none
    policy.script_src  :self, 'https://js.stripe.com'
    policy.style_src   :self, :unsafe_inline  # Tailwind requires inline styles
    policy.connect_src :self, 'https://api.stripe.com'
    policy.frame_src   'https://js.stripe.com', 'https://hooks.stripe.com'
  end
end
```

### Additional Security Headers

**SecureHeaders Gem** (`config/initializers/secure_headers.rb`):
```ruby
SecureHeaders::Configuration.default do |config|
  config.x_frame_options = "DENY"
  config.x_content_type_options = "nosniff"
  config.x_xss_protection = "1; mode=block"
  config.x_download_options = "noopen"
  config.x_permitted_cross_domain_policies = "none"
  config.referrer_policy = %w[origin-when-cross-origin strict-origin-when-cross-origin]
end
```

---

## 🎯 Feature Implementation Roadmap

### Phase 1: Foundation (Week 1) ✅ COMPLETE

**Day 1-2: Rails Setup**
- [x] Create new Rails 8 app with PostgreSQL
- [x] Configure Tailwind CSS
- [x] Set up Hotwire (Turbo + Stimulus)
- [x] Configure development environment
- [x] Git repository initialization
- [x] Database configuration

**Day 3-4: Database Schema**
- [x] Create all migrations (Users, Products, Carts, Orders)
- [x] Write model validations and associations
- [x] Create seed file with 4 products
- [x] Test database relationships
- [x] Add indexes for performance

**Day 5-7: Authentication**
- [x] Build passwordless auth flow
- [x] Sessions controller (email input, code verification)
- [x] Authentication service (User model methods)
- [x] ActionMailer setup for verification emails
- [x] Rate limiting with Rack::Attack
- [x] Login/logout functionality

---

### Phase 2: Core E-Commerce (Week 2) - Complete ✅

**🎉 Phase 2 Fully Implemented and Tested!**

**✅ Complete Stripe Payment Integration:**
- ✅ Embedded Stripe Checkout (Modern UI)
- ✅ Guest checkout support
- ✅ Webhook handling for payment confirmation
- ✅ Order creation from Stripe sessions
- ✅ Cart clearing after successful purchase
- ✅ Order confirmation emails
- ✅ Session-based guest cart persistence
- ✅ Real-time cart calculations

**Day 8-10: Product Catalog**
- [x] Products controller (index, show) ✅
- [x] Product views with Tailwind styling ✅
- [x] Product card ViewComponent ✅
- [x] Image handling (CDN setup) ✅
- [x] Category filtering ✅
- [x] Search functionality (basic) ✅

**Day 11-12: Shopping Cart**
- [x] Cart controller and views ✅
- [x] CartItems controller (add, update, remove) ✅
- [x] Turbo Frames for cart updates ✅
- [x] Cart persistence ✅
- [x] Cart item count badge ✅
- [x] Guest cart support ✅
- [x] Checkout flow preparation ✅

**Guest User Requirements:**
- ✅ Browse products without login
- ✅ Add items to cart without login (session-based)
- ✅ Checkout process for guests
- ✅ Order confirmation email for guests
- ❌ No order history access for guests

**Day 13-14: Stripe Integration** - Complete ✅
- [x] Stripe gem configuration ✅
- [x] Checkout controller ✅
- [x] Embedded Stripe Checkout ✅
- [x] Webhook handler for payment confirmation ✅
- [x] Order creation from Stripe session ✅
- [x] Cart clearing after purchase ✅
- [x] Order confirmation emails ✅

---

### Phase 3: UI/UX Polish (Week 3) - Ready to Start

**Day 15-16: Homepage & Layout**
- [ ] Application layout with navbar and footer
- [ ] Homepage with hero section
- [ ] Product carousel (Stimulus controller)
- [ ] ViewComponents for reusable UI
- [ ] Mobile responsive design
- [ ] Favicon and meta tags

**Day 17-18: Product Pages**
- [ ] Product detail page design
- [ ] Image gallery
- [ ] Product description formatting
- [ ] Related products section
- [ ] Breadcrumbs navigation

**Day 19-20: Cart & Checkout UI**
- [ ] Cart page redesign
- [ ] Empty cart state
- [ ] Checkout flow refinement
- [ ] Loading states and transitions
- [ ] Success page design

**Day 21: Responsive & Animations**
- [ ] Mobile menu (Stimulus)
- [ ] Smooth scroll animations
- [ ] Hover effects and transitions
- [ ] Toast notifications (Stimulus)
- [ ] Form validation feedback

---

### Phase 4: Orders & Admin (Week 4)

**Day 22-23: Order Management**
- [ ] Orders controller (index, show)
- [ ] Order history page
- [ ] Order details view
- [ ] Order status tracking
- [ ] Email confirmation on order

**Day 24-26: Admin Dashboard**
- [ ] Admin authentication (email whitelist)
- [ ] Admin layout
- [ ] Product CRUD (create, edit, delete)
- [ ] Order management (view, update status)
- [ ] Basic analytics dashboard
- [ ] Sales overview

**Day 27-28: Email Templates**
- [ ] Verification email HTML/text
- [ ] Order confirmation email
- [ ] Shipping notification email
- [ ] Email preview functionality
- [ ] Gmail SMTP setup for production

---

### Phase 5: Testing & Deployment (Week 5-6)

**Day 29-31: Testing**
- [ ] RSpec setup
- [ ] Model specs (validations, associations)
- [ ] Request specs (controllers)
- [ ] System specs (E2E flows)
- [ ] Test coverage report

**Day 32-33: Security & Performance**
- [ ] Brakeman security scan
- [ ] Fix N+1 queries (Bullet gem)
- [ ] Database indexes optimization
- [ ] Image optimization
- [ ] Asset precompilation
- [ ] Lighthouse performance audit

**Day 34-36: Deployment**
- [ ] Heroku app creation
- [ ] Environment variables setup
- [ ] PostgreSQL provision
- [ ] Stripe production keys
- [ ] Gmail SMTP configuration
- [ ] Deploy to Heroku
- [ ] Test production deployment

**Day 37-40: Final Polish**
- [ ] Bug fixes
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Load testing
- [ ] Documentation (README)
- [ ] Launch! 🚀

---

## 🚀 Deployment Configuration

### Heroku Setup

**Procfile:**
```
web: bundle exec puma -C config/puma.rb
worker: bundle exec good_job start
release: bundle exec rails db:migrate
```

**app.json** (for review apps):
```json
{
  "name": "kerfunkle-rails",
  "description": "E-commerce platform for party supplies",
  "repository": "https://github.com/yourusername/kerfunkle-rails",
  "addons": [
    "heroku-postgresql:essential-0"
  ],
  "env": {
    "STRIPE_SECRET_KEY": {
      "description": "Stripe secret key"
    },
    "STRIPE_PUBLISHABLE_KEY": {
      "description": "Stripe publishable key"
    },
    "ADMIN_EMAILS": {
      "description": "Comma-separated admin emails"
    }
  }
}
```

### Environment Variables

**Required ENV Variables:**
```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_DOMAIN=kerfunkle.com

# Application
RAILS_MASTER_KEY=...
APP_DOMAIN=kerfunkle-rails.herokuapp.com

# Admin
ADMIN_EMAILS=admin@kerfunkle.com,owner@kerfunkle.com

# Rails
RAILS_ENV=production
RACK_ENV=production
RAILS_SERVE_STATIC_FILES=true
RAILS_LOG_TO_STDOUT=true
```

### Database Configuration

**config/database.yml:**
```yaml
production:
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  url: <%= ENV['DATABASE_URL'] %>
  prepared_statements: false
```

### Puma Configuration

**config/puma.rb:**
```ruby
workers Integer(ENV.fetch("WEB_CONCURRENCY") { 0 })
threads_count = Integer(ENV.fetch("RAILS_MAX_THREADS") { 5 })
threads threads_count, threads_count

preload_app!

rackup      DefaultRackup
port        ENV.fetch("PORT") { 3000 }
environment ENV.fetch("RAILS_ENV") { "development" }

on_worker_boot do
  ActiveRecord::Base.establish_connection
end
```

---

## 💰 Budget & Cost Optimization

### Heroku Eco Dyno Strategy

**Dyno Configuration:**
- **1 Eco Dyno** ($5/month) - Runs web + worker processes
- **PostgreSQL Essential-0** (Free tier) - 10K rows, 1GB storage
- **No Redis** - Using database-backed jobs (GoodJob)

**Cost Breakdown:**
| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Heroku Eco Dyno | 1 dyno | $5.00 |
| PostgreSQL | Free | $0.00 |
| Email (Gmail SMTP) | Free | $0.00 |
| **Total** | | **$5.00** |

**Free Tier Limits:**
- PostgreSQL: 10,000 rows (sufficient for small-medium catalog)
- Gmail SMTP: 500 emails/day (more than enough for verification codes + order confirmations)
- Dyno hours: Always-on with Eco

### Performance Optimizations for Low Resources

1. **Database Connection Pooling**
   - Limit connections to 5 (Puma threads)
   - Use prepared statements

2. **Asset Optimization**
   - Tailwind CSS purging (production)
   - Image lazy loading
   - CDN for product images (Cloudinary free tier)

3. **Caching Strategies**
   - Fragment caching for product listings
   - Low-level caching for expensive queries
   - HTTP caching headers

4. **Background Jobs**
   - GoodJob with limited workers (2-3)
   - Database-backed queue (no Redis cost)
   - Job prioritization

5. **Monitoring**
   - Heroku metrics (free)
   - Rails logs
   - Error tracking: Rollbar free tier or Sentry

---

## 📦 Gemfile

**Complete Gem List:**
```ruby
source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.2"

# Core Rails
gem "rails", "~> 7.1.0"
gem "pg", "~> 1.5"
gem "puma", "~> 6.4"

# Frontend
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "tailwindcss-rails"
gem "view_component"

# Background Jobs (no Redis)
gem "good_job"

# Payment
gem "stripe"

# Authentication & Security
gem "bcrypt", "~> 3.1.7"
gem "rack-attack"
gem "secure_headers"

# Utilities
gem "pagy"  # Pagination

# Production
gem "bootsnap", require: false

group :development, :test do
  gem "debug"
  gem "rspec-rails"
  gem "factory_bot_rails"
  gem "faker"
  gem "pry-rails"
end

group :development do
  gem "web-console"
  gem "rubocop-rails", require: false
  gem "brakeman", require: false
  gem "bullet"  # N+1 detection
  gem "annotate"
  gem "letter_opener"  # Email preview
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "shoulda-matchers"
end
```

---

## ✅ Success Metrics

### Technical Goals
- [ ] 100% feature parity with Node.js app
- [ ] Page load time < 2 seconds (Lighthouse)
- [ ] Mobile responsive (all breakpoints)
- [ ] Accessibility score > 90 (Lighthouse)
- [ ] Security audit passing (Brakeman)
- [ ] Test coverage > 80%

### Business Goals
- [ ] Passwordless auth working smoothly
- [ ] Stripe checkout functional
- [ ] Email delivery reliable
- [ ] Order tracking accurate
- [ ] Admin can manage products/orders
- [ ] Under $10/month hosting cost

### User Experience Goals
- [ ] Modern, attractive design
- [ ] Smooth page transitions (Turbo)
- [ ] Fast cart updates (no page reload)
- [ ] Clear checkout flow
- [ ] Mobile-friendly interface
- [ ] Professional brand presence

---

## 📚 Resources & References

### Documentation
- [Ruby on Rails Guides](https://guides.rubyonrails.org/)
- [Hotwire Handbook](https://hotwired.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Stripe Ruby SDK](https://stripe.com/docs/api?lang=ruby)
- [ViewComponent Guide](https://viewcomponent.org/)
- [GoodJob Documentation](https://github.com/bensheldon/good_job)

### Design Inspiration
- [Droppiez](https://droppiez.com/) - E-commerce design patterns
- [Dumbclub](https://www.dumbclub.com/) - Brand personality & minimalism

### Community
- [Rails Discord](https://discord.gg/railslink)
- [Hotwire Discussion](https://discuss.hotwired.dev/)
- [Stimulus Community](https://discourse.stimulusjs.org/)

---

## 🔄 Migration from Node.js - Feature Mapping

| Node.js/Express | Ruby on Rails | Status |
|----------------|---------------|--------|
| `server.js` | Multiple controllers | ✅ Planned |
| MongoDB Schemas | ActiveRecord Models | ✅ Planned |
| JWT Auth | Session-based Auth | ✅ Planned |
| Express middleware | Rack middleware | ✅ Planned |
| Nodemailer | ActionMailer | ✅ Planned |
| Winston logging | Rails.logger | ✅ Planned |
| Helmet | SecureHeaders | ✅ Planned |
| CORS | Rack::CORS | ✅ Planned |
| Rate limiting | Rack::Attack | ✅ Planned |
| Stripe SDK | Stripe gem | ✅ Planned |
| Static files | Asset Pipeline | ✅ Planned |
| `.env` | credentials.yml.enc | ✅ Planned |

---

## 🎬 Next Steps

1. **Initialize Rails Application**
   ```bash
   cd /home/stevelin419/Projects/Kerfunkle-Rails
   rails new . --database=postgresql --css=tailwind --javascript=importmap
   ```

2. **Install Dependencies**
   ```bash
   bundle install
   rails tailwindcss:install
   ```

3. **Create Database**
   ```bash
   rails db:create
   ```

4. **Generate Models**
   ```bash
   rails g model User email:string verification_code:string code_expires_at:datetime login_attempts:integer last_login_at:datetime
   rails g model Product name:string description:text price:decimal stripe_price_id:string product_number:string image_url:string active:boolean position:integer category:string
   rails g model Cart user:references
   rails g model CartItem cart:references product:references quantity:integer
   rails g model Order user:references stripe_checkout_session_id:string stripe_payment_intent_id:string status:string total_amount:decimal customer_email:string shipping_address:jsonb billing_address:jsonb paid_at:datetime shipped_at:datetime
   rails g model OrderItem order:references product:references quantity:integer price_at_purchase:decimal product_name:string product_image_url:string
   ```

5. **Run Migrations**
   ```bash
   rails db:migrate
   ```

6. **Start Building!** 🚀

---

**Document Version:** 1.0  
**Last Updated:** October 10, 2025  
**Author:** AI Assistant  
**Status:** Planning Phase

