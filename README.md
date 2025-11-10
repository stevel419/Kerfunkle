# Kerfunkle - E-Commerce Platform (Rails Migration)

A modern e-commerce platform for party supplies, migrated from Node.js/Express to Ruby on Rails.

## 🚀 Quick Start

```bash
# Install dependencies
bundle install

# Setup database
rails db:create db:migrate db:seed

# Start development server
bin/dev
```

Visit: http://localhost:3000

## 🎯 Project Overview

**Kerfunkle** is a dropshipping e-commerce platform specializing in party essentials including LED lights, disco balls, fog machines, and accessories.

### Migration Progress

- ✅ **Phase 1 Complete** - Foundation (Authentication, Database, Basic UI)
- ⏳ **Phase 2** - Shopping Cart & Stripe Integration
- ⏳ **Phase 3** - UI/UX Polish
- ⏳ **Phase 4** - Orders & Admin Dashboard
- ⏳ **Phase 5** - Testing & Deployment

See `scope.md` for detailed migration plan.

## 🛠️ Tech Stack

**Backend:**
- Ruby on Rails 8.0
- PostgreSQL
- Solid Queue (background jobs)

**Frontend:**
- Hotwire (Turbo + Stimulus)
- Tailwind CSS 4
- ImportMap (no build step)

**Features:**
- Stripe for payments
- Rack::Attack for rate limiting
- ActionMailer with Gmail SMTP
- Passwordless email authentication

## 📦 Current Features

### Authentication
- Passwordless login with 6-digit email codes
- Rate limiting (5 attempts/hour)
- Session-based auth (secure cookies)
- Auto-expiring verification codes (15 min)

### Products
- 4 party products seeded
- Category-based organization
- Active/inactive status
- Position-based sorting

### Database
- Users, Products, Carts, Cart Items, Orders, Order Items
- Proper associations and validations
- Indexed for performance
- JSONB for flexible address storage

## 🎨 Design

Inspired by modern e-commerce sites:
- Bold typography
- Purple accent color (#9333EA)
- Clean, minimal interface
- Mobile-responsive
- Smooth Turbo transitions

## 📧 Email Configuration

**Development:**
- Uses `letter_opener` (emails open in browser)
- No SMTP configuration needed

**Production:**
- Gmail SMTP ready
- Set environment variables:
  ```bash
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-password
  ```

## 🔒 Security

- Rack::Attack rate limiting
- CSRF protection
- SQL injection prevention (ActiveRecord)
- XSS protection (auto-escaping)
- Login attempt throttling
- Secure session cookies

## 📁 Project Structure

```
app/
├── controllers/     # Request handling
├── models/          # Business logic & database
├── views/           # HTML templates
├── mailers/         # Email senders
└── javascript/      # Stimulus controllers

config/
├── routes.rb        # URL routing
├── database.yml     # Database config
└── initializers/    # App configuration

db/
├── migrate/         # Database migrations
└── seeds.rb         # Sample data

scope.md             # Detailed migration plan
PHASE1_COMPLETE.md   # Phase 1 summary
```

## 🧪 Testing

```bash
# Run all tests
bundle exec rspec

# Run specific test
bundle exec rspec spec/models/user_spec.rb
```

## 🚢 Deployment

Configured for **Heroku Eco Dyno** ($5/month):

```bash
# Create Heroku app
heroku create kerfunkle-rails

# Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# Set environment variables
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password

# Deploy
git push heroku main

# Run migrations
heroku run rails db:migrate db:seed
```

See `scope.md` for complete deployment guide.

## 📊 Database Schema

**Main Tables:**
- `users` - Customer accounts
- `products` - Product catalog
- `carts` - Shopping carts
- `cart_items` - Cart line items
- `orders` - Purchase orders
- `order_items` - Order line items

Run `rails db:schema:dump` to see full schema.

## 🎯 Next Features (Phase 2)

1. Shopping cart UI
2. Add/remove items with Turbo Frames
3. Stripe checkout integration
4. Order confirmation
5. Order history page

## 📝 Environment Variables

**Required for Production:**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
EMAIL_USER=noreply@kerfunkle.com
EMAIL_PASS=your-gmail-app-password
RAILS_MASTER_KEY=... (generated)
```

## 🤝 Contributing

This is a migration project following the detailed plan in `scope.md`.

## 📄 License

All rights reserved.

## 📞 Support

For questions about the migration, see `scope.md` or `PHASE1_COMPLETE.md`.

---

**Status:** Phase 1 Complete ✅  
**Last Updated:** October 10, 2025
