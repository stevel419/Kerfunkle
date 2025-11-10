# 🚀 Heroku Deployment - Quick Commands

## One-Time Setup Commands

```bash
# 1. Commit and push to GitHub
cd /home/stevelin419/Projects/Kerfunkle-Rails
git add -A
git commit -m "Production-ready Kerfunkle Rails app with all features"
git remote add origin https://github.com/stevel419/Kerfunkle.git
git push -u origin main --force

# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create kerfunkle

# 4. Add buildpacks
heroku buildpacks:add heroku/ruby
heroku buildpacks:add heroku/nodejs

# 5. Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# 6. Set environment variables (REPLACE WITH YOUR ACTUAL VALUES!)
heroku config:set EMAIL_USER=officialkerfunkle@gmail.com
heroku config:set EMAIL_PASS=your-16-digit-app-password
heroku config:set EMAIL_DOMAIN=kerfunkle.com
heroku config:set APP_DOMAIN=kerfunkle.herokuapp.com
heroku config:set RAILS_ENV=production
heroku config:set RAILS_SERVE_STATIC_FILES=true
heroku config:set RAILS_LOG_TO_STDOUT=true
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_your_key
heroku config:set STRIPE_SECRET_KEY=sk_live_your_key
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_your_secret
heroku config:set RAILS_MASTER_KEY=$(cat config/master.key)

# 7. Deploy to Heroku
git push heroku main

# 8. Run database setup
heroku run rails db:migrate
heroku run rails db:seed

# 9. Open your app
heroku open
```

---

## Required Environment Variables Checklist

```bash
✅ EMAIL_USER=officialkerfunkle@gmail.com
✅ EMAIL_PASS=your-16-digit-app-password
✅ EMAIL_DOMAIN=kerfunkle.com
✅ APP_DOMAIN=kerfunkle.herokuapp.com
✅ STRIPE_PUBLISHABLE_KEY=pk_live_...
✅ STRIPE_SECRET_KEY=sk_live_...
✅ STRIPE_WEBHOOK_SECRET=whsec_...
✅ RAILS_MASTER_KEY=<from config/master.key>
✅ RAILS_ENV=production
✅ RAILS_SERVE_STATIC_FILES=true
✅ RAILS_LOG_TO_STDOUT=true
```

---

## Buildpacks Required

```
1. heroku/ruby    (for Rails)
2. heroku/nodejs  (for assets)
```

---

## PostgreSQL Database

Heroku automatically provides PostgreSQL via `DATABASE_URL`.

The `mini` tier includes:
- 10,000 rows
- 1 GB storage
- Free!

Upgrade later if needed:
```bash
heroku addons:upgrade heroku-postgresql:basic
```

---

## Update/Redeploy Commands

```bash
# After making changes:
git add -A
git commit -m "Your update message"
git push origin main    # Push to GitHub
git push heroku main    # Deploy to Heroku

# If database changed:
heroku run rails db:migrate
```

---

## Useful Commands

```bash
# View logs
heroku logs --tail

# Open app
heroku open

# Rails console
heroku run rails console

# Restart app
heroku restart

# Check status
heroku ps

# View config
heroku config

# Database info
heroku pg:info

# Connect to database
heroku pg:psql
```

---

## Stripe Webhook Configuration

After deploying, update your Stripe webhook:

1. Go to: https://dashboard.stripe.com/webhooks
2. Update endpoint URL to: `https://kerfunkle.herokuapp.com/stripe/webhook`
3. Copy the signing secret
4. Update Heroku:
   ```bash
   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_new_secret
   ```

---

## Testing Checklist

- [ ] App loads at `https://kerfunkle.herokuapp.com`
- [ ] Products page displays
- [ ] Can add items to cart
- [ ] Login with email code works
- [ ] Email code received in inbox
- [ ] Checkout completes successfully
- [ ] Order confirmation email received
- [ ] Dashboard shows orders
- [ ] Order history accessible

---

## Troubleshooting

**Assets not loading?**
```bash
heroku config:set RAILS_SERVE_STATIC_FILES=true
git commit --allow-empty -m "Rebuild"
git push heroku main
```

**Emails not sending?**
```bash
heroku config | grep EMAIL
heroku logs --tail | grep -i smtp
```

**Database issues?**
```bash
heroku run rails db:migrate
heroku run rails console
```

**View errors:**
```bash
heroku logs --tail --source app
```

---

## 🎉 You're Live!

Once deployed, your app will be available at:
**https://kerfunkle.herokuapp.com**

Party hard with Kerfunkle! 🎊

