# Kerfunkle - E-Commerce Platform

A modern e-commerce platform for party supplies, migrated from Node.js/Express to Ruby on Rails.

## Quick Start

```bash
# Install dependencies
bundle install

# Setup database
rails db:create db:migrate db:seed

# Start development server
bin/dev
```

Visit: http://localhost:3000

## Project Overview

**Kerfunkle** is a dropshipping e-commerce platform specializing in party essentials including LED lights, disco balls, fog machines, and accessories.

## Tech Stack

**Backend:**
- Ruby on Rails 8.0
- PostgreSQL

**Frontend:**
- Hotwire (Turbo + Stimulus)
- Tailwind CSS 4
- ImportMap

**Features:**
- Stripe for payments
- Rack::Attack for rate limiting
- ActionMailer with Gmail SMTP
- Passwordless email authentication

## Current Features

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

## Security

- Rack::Attack rate limiting
- CSRF protection
- SQL injection prevention (ActiveRecord)
- XSS protection (auto-escaping)
- Login attempt throttling
- Secure session cookies

## Project Structure

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
```

## Database Schema

**Main Tables:**
- `users` - Customer accounts
- `products` - Product catalog
- `carts` - Shopping carts
- `cart_items` - Cart line items
- `orders` - Purchase orders
- `order_items` - Order line items

## Contributing

This is a production ready e-commerce website template in Ruby on Rails.

## License

All rights reserved.
