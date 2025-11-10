# 🚀 Heroku Deployment Guide for Kerfunkle Rails

## Prerequisites

- [ ] Heroku CLI installed
- [ ] Heroku account created
- [ ] GitHub repository: https://github.com/stevel419/Kerfunkle.git
- [ ] Gmail App Password for email (see DEPLOYMENT.md)

---

## 📋 Step 1: Push to GitHub

### Add GitHub Remote and Push

```bash
cd /home/stevelin419/Projects/Kerfunkle-Rails

# Add all files
git add -A

# Commit
git commit -m "Initial commit - Kerfunkle Rails production-ready app"

# Add your GitHub repo as remote (replace old Node.js project)
git remote add origin https://github.com/stevel419/Kerfunkle.git

# Force push to replace the old repo content
git push -u origin main --force
```

**Note:** This will replace the old Node.js dropshipping project with your new Rails app.

---

## 🔧 Step 2: Install Heroku CLI (if not installed)

```bash
# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh

# Or using snap
sudo snap install --classic heroku

# Verify installation
heroku --version
```

---

## 🔐 Step 3: Login to Heroku

```bash
heroku login
```

This will open a browser window for authentication.

---

## 🎯 Step 4: Create Heroku App

```bash
# Create app (replace 'kerfunkle' with your desired name if taken)
heroku create kerfunkle

# Or if that name is taken, use a custom name:
# heroku create kerfunkle-rails-store

# Check your app was created
heroku apps
```

Your app will be available at: `https://kerfunkle.herokuapp.com` (or your custom name)

---

## 🏗️ Step 5: Configure Buildpacks

Rails apps on Heroku need specific buildpacks. Add them in this order:

```bash
# 1. Ruby buildpack (for Rails)
heroku buildpacks:add heroku/ruby

# 2. Node.js buildpack (for JavaScript assets via importmap)
heroku buildpacks:add heroku/nodejs

# Verify buildpacks are added in correct order
heroku buildpacks
```

**Expected output:**
```
=== kerfunkle Buildpack URLs
1. heroku/ruby
2. heroku/nodejs
```

**Why these buildpacks?**
- `heroku/ruby`: Compiles Ruby/Rails app
- `heroku/nodejs`: Compiles JavaScript assets and CSS (Tailwind)

---

## 🗄️ Step 6: Add PostgreSQL Database

Heroku uses PostgreSQL by default for Rails apps.

```bash
# Add Heroku Postgres (free tier: mini)
heroku addons:create heroku-postgresql:mini

# Verify database was added
heroku addons

# Check database URL
heroku config:get DATABASE_URL
```

**Note:** Heroku automatically sets `DATABASE_URL` environment variable.

---

## 🔑 Step 7: Set Environment Variables

Set all required environment variables for your app:

```bash
# Email Configuration (Gmail SMTP)
heroku config:set EMAIL_USER=officialkerfunkle@gmail.com
heroku config:set EMAIL_PASS=your-16-digit-app-password
heroku config:set EMAIL_DOMAIN=kerfunkle.com

# Application Configuration
heroku config:set APP_DOMAIN=kerfunkle.herokuapp.com
heroku config:set RAILS_ENV=production
heroku config:set RAILS_LOG_LEVEL=info
heroku config:set RAILS_SERVE_STATIC_FILES=true
heroku config:set RAILS_LOG_TO_STDOUT=true

# Stripe Configuration (use PRODUCTION keys!)
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_...
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...

# Rails Master Key (for credentials)
heroku config:set RAILS_MASTER_KEY=$(cat config/master.key)

# Verify all config vars
heroku config
```

**Important:** Replace the placeholder values with your actual credentials.

---

## 📦 Step 8: Create Package.json for Node.js Buildpack

Heroku's Node.js buildpack needs a `package.json` file:

```bash
# Create package.json if it doesn't exist
cat > package.json << 'EOF'
{
  "name": "kerfunkle-rails",
  "version": "1.0.0",
  "description": "Kerfunkle - Party Supply E-commerce Store",
  "engines": {
    "node": "20.x",
    "npm": "10.x"
  },
  "scripts": {
    "build": "echo 'Assets will be precompiled by Rails'"
  },
  "keywords": ["rails", "ecommerce", "kerfunkle"],
  "author": "Steve Lin",
  "license": "MIT"
}
EOF

# Add to git
git add package.json
git commit -m "Add package.json for Heroku Node.js buildpack"
```

---

## 🚀 Step 9: Deploy to Heroku

Now push your app to Heroku:

```bash
# Push to Heroku (this triggers the build)
git push heroku main

# Watch the build logs
heroku logs --tail
```

**Build process:**
1. Detects Ruby/Rails app
2. Installs Ruby gems (`bundle install`)
3. Installs Node.js dependencies (if any)
4. Precompiles assets (`rails assets:precompile`)
5. Sets up database
6. Starts Puma web server

---

## 🗃️ Step 10: Run Database Migrations

After deployment, run migrations to set up your database:

```bash
# Run migrations
heroku run rails db:migrate

# Seed database with products
heroku run rails db:seed

# Or run both together
heroku run rails db:migrate db:seed
```

---

## ✅ Step 11: Verify Deployment

Check if your app is running:

```bash
# Open app in browser
heroku open

# Check app status
heroku ps

# View recent logs
heroku logs --tail

# Check database
heroku pg:info
```

---

## 🔧 Step 12: Configure Stripe Webhooks

### Update Stripe Webhook URL

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click on your webhook or create a new one
3. Update the endpoint URL to:
   ```
   https://kerfunkle.herokuapp.com/stripe/webhook
   ```
4. Ensure these events are enabled:
   - `checkout.session.completed`
   - `payment_intent.succeeded`

5. Copy the **Webhook Signing Secret** and update Heroku:
   ```bash
   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_your_new_secret
   ```

---

## 📧 Step 13: Test Email Delivery

Test that emails are working:

```bash
# Open Rails console on Heroku
heroku run rails console

# In the console, test email:
user = User.first_or_create(email: 'test@example.com')
user.generate_verification_code
UserMailer.verification_code(user).deliver_now

# Exit console
exit
```

Check if the email arrives with the Kerfunkle logo!

---

## 🔍 Step 14: Monitor Your App

### View Logs

```bash
# Tail logs (real-time)
heroku logs --tail

# View last 200 lines
heroku logs -n 200

# Filter by source
heroku logs --source app
```

### Check App Performance

```bash
# View dynos (web servers)
heroku ps

# Scale dynos (if needed)
heroku ps:scale web=1

# Restart app
heroku restart
```

### Database Management

```bash
# Connect to database
heroku pg:psql

# View database info
heroku pg:info

# Backup database
heroku pg:backups:capture
heroku pg:backups:download
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Assets Not Loading

**Problem:** CSS/JS files return 404

**Solution:**
```bash
heroku config:set RAILS_SERVE_STATIC_FILES=true
git commit --allow-empty -m "Rebuild assets"
git push heroku main
```

### Issue 2: Database Connection Error

**Problem:** `PG::ConnectionBad`

**Solution:**
```bash
# Check DATABASE_URL is set
heroku config:get DATABASE_URL

# Run migrations again
heroku run rails db:migrate
```

### Issue 3: Precompile Fails

**Problem:** Asset precompilation fails during build

**Solution:**
```bash
# Precompile locally and commit
RAILS_ENV=production rails assets:precompile
git add public/assets
git commit -m "Precompiled assets"
git push heroku main
```

### Issue 4: Email Not Sending

**Problem:** Emails not being delivered

**Solution:**
```bash
# Verify email config
heroku config | grep EMAIL

# Check Gmail App Password is correct (16 digits, no spaces)
heroku config:set EMAIL_PASS=your-correct-password

# Check logs for SMTP errors
heroku logs --tail | grep -i smtp
```

### Issue 5: Webhook Not Working

**Problem:** Orders not completing after payment

**Solution:**
1. Verify webhook URL in Stripe Dashboard
2. Check webhook secret:
   ```bash
   heroku config:get STRIPE_WEBHOOK_SECRET
   ```
3. View webhook logs in Stripe Dashboard
4. Check Heroku logs for webhook errors

---

## 📊 Performance Optimization

### Enable Caching

```bash
# Enable caching in production
heroku config:set RAILS_CACHE_STORE=memory_store
```

### Monitor Performance

```bash
# Install New Relic (optional)
heroku addons:create newrelic:wayne

# Or use Heroku metrics
heroku logs --tail | grep "request_id"
```

---

## 🔄 Updating Your App

When you make changes:

```bash
# 1. Commit changes
git add -A
git commit -m "Your commit message"

# 2. Push to GitHub (optional but recommended)
git push origin main

# 3. Deploy to Heroku
git push heroku main

# 4. Run migrations if you changed database
heroku run rails db:migrate
```

---

## 🌐 Custom Domain (Optional)

To use `kerfunkle.com` instead of `kerfunkle.herokuapp.com`:

```bash
# Add custom domain
heroku domains:add kerfunkle.com
heroku domains:add www.kerfunkle.com

# Get DNS target
heroku domains

# Update DNS records at your domain registrar:
# - Add CNAME record: www -> your-app-name.herokudns.com
# - Add ALIAS/ANAME record: @ -> your-app-name.herokudns.com

# Wait for DNS propagation (can take up to 48 hours)

# Enable SSL (free with Heroku)
heroku certs:auto:enable
```

---

## 💰 Heroku Pricing

### Free Tier (Eco Dynos - $5/month)
- 1000 dyno hours/month
- Sleeps after 30 min of inactivity
- Limited to 10,000 rows in database

### Recommended for Production (Basic - $7/month)
- No sleeping
- Custom domain with SSL
- Better performance

### Upgrade Dyno

```bash
# Upgrade to Basic
heroku ps:type basic

# Check pricing
heroku ps
```

---

## 📚 Useful Commands Reference

```bash
# App Management
heroku apps                        # List all apps
heroku apps:info                   # App details
heroku open                        # Open app in browser
heroku restart                     # Restart app

# Logs
heroku logs --tail                 # Real-time logs
heroku logs -n 500                 # Last 500 lines
heroku logs --source app          # App logs only

# Database
heroku pg:info                     # Database info
heroku pg:psql                     # Connect to database
heroku run rails db:migrate       # Run migrations
heroku run rails db:seed          # Seed database
heroku run rails console          # Rails console

# Config
heroku config                      # View all config vars
heroku config:set KEY=value       # Set config var
heroku config:unset KEY           # Remove config var

# Dynos
heroku ps                          # View dynos
heroku ps:scale web=1             # Scale dynos
heroku ps:restart                 # Restart dynos

# Buildpacks
heroku buildpacks                  # List buildpacks
heroku buildpacks:add PACK        # Add buildpack
heroku buildpacks:remove PACK     # Remove buildpack

# Add-ons
heroku addons                      # List add-ons
heroku addons:create NAME         # Add add-on
heroku addons:destroy NAME        # Remove add-on
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Stripe webhook configured with production URL
- [ ] Email sending tested (verification codes work)
- [ ] Test complete user flow:
  - [ ] Browse products
  - [ ] Add to cart
  - [ ] Login with email code
  - [ ] Complete checkout
  - [ ] Receive order confirmation email
  - [ ] View order in dashboard
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 🆘 Getting Help

- **Heroku Docs:** https://devcenter.heroku.com/articles/getting-started-with-rails7
- **Heroku Support:** https://help.heroku.com
- **Check Logs:** `heroku logs --tail`
- **Rails on Heroku:** https://devcenter.heroku.com/categories/ruby-support

---

## 🎉 You're Ready to Deploy!

Your Kerfunkle Rails app is production-ready. Follow the steps above and you'll have it live on Heroku in no time!

**Party hard with Kerfunkle! 🎊**

