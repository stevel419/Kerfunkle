# 🚀 Kerfunkle Rails - Production Deployment Guide

## 📋 Prerequisites

Before deploying to production, ensure you have:

- [ ] A Gmail account for sending emails
- [ ] Gmail 2-Factor Authentication enabled
- [ ] A 16-digit Gmail App Password generated
- [ ] A production server or hosting platform (Heroku, Render, AWS, etc.)
- [ ] Production database configured
- [ ] Stripe production keys

---

## 🔐 Step 1: Generate Gmail App Password

### Why App Password?
Gmail requires App Passwords for applications to send emails securely when 2FA is enabled.

### Steps:
1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-digit password (format: `xxxx xxxx xxxx xxxx`)
   - Save this securely - you'll need it for `EMAIL_PASS`

---

## 🌍 Step 2: Configure Environment Variables

### Required Environment Variables

Create a `.env` file or configure these on your hosting platform:

```bash
# ===== EMAIL CONFIGURATION =====
# Your Gmail address (e.g., officialkerfunkle@gmail.com)
EMAIL_USER=your-email@gmail.com

# Your 16-digit Gmail App Password (no spaces)
# Example: abcdabcdabcdabcd
EMAIL_PASS=your-16-digit-app-password

# Domain for email links (your production domain)
EMAIL_DOMAIN=kerfunkle.com

# ===== APPLICATION CONFIGURATION =====
# Your production domain (for generating links in emails)
APP_DOMAIN=kerfunkle.com

# Rails secret key (generate with: rails secret)
SECRET_KEY_BASE=your-secret-key-base

# Database URL (depends on your hosting provider)
DATABASE_URL=postgresql://username:password@host:port/database

# ===== STRIPE CONFIGURATION =====
# Use your PRODUCTION Stripe keys (not test keys!)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ===== RAILS ENVIRONMENT =====
RAILS_ENV=production
RAILS_LOG_LEVEL=info
```

### Security Notes:
- ⚠️ **NEVER** commit `.env` files to Git
- ⚠️ **NEVER** share your App Password
- ⚠️ Use environment variables on your hosting platform
- ⚠️ Rotate secrets regularly

---

## 📧 Step 3: Email Configuration Details

### Gmail SMTP Settings (Already Configured)

The app is configured to use Gmail SMTP with these settings:

```ruby
# config/environments/production.rb
config.action_mailer.smtp_settings = {
  address: 'smtp.gmail.com',
  port: 587,
  domain: ENV['EMAIL_DOMAIN'],
  user_name: ENV['EMAIL_USER'],
  password: ENV['EMAIL_PASS'],
  authentication: 'plain',
  enable_starttls_auto: true
}
```

### Email Sending Limits

- **Free Gmail Account**: 500 emails per day
- **Google Workspace**: 2,000 emails per day

For your use case (login codes + order confirmations), 500/day should be sufficient.

### Email Templates

The app sends two types of emails:

1. **Login Verification Codes**
   - Sent when users log in
   - Contains 6-digit code
   - Includes Kerfunkle logo
   - 15-minute expiration

2. **Order Confirmations**
   - Sent after successful checkout
   - Contains order details, items, shipping address
   - Includes Kerfunkle logo
   - Professional receipt format

---

## 🖼️ Step 4: Logo in Emails

The Kerfunkle logo is automatically embedded in all emails as an inline attachment.

### How It Works:
- Logo is read from `public/imgs/logo.png`
- Attached as inline image to each email
- Displays at 200px width
- Centered in header

### Verify Logo Exists:
```bash
ls -la public/imgs/logo.png
```

If missing, ensure your logo is placed at this path before deploying.

---

## 🚀 Step 5: Deployment Platforms

### Option A: Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create kerfunkle

# Set environment variables
heroku config:set EMAIL_USER=officialkerfunkle@gmail.com
heroku config:set EMAIL_PASS=your-16-digit-password
heroku config:set EMAIL_DOMAIN=kerfunkle.com
heroku config:set APP_DOMAIN=kerfunkle.herokuapp.com
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_...
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...

# Deploy
git push heroku main

# Run migrations
heroku run rails db:migrate

# Seed data (if needed)
heroku run rails db:seed
```

### Option B: Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Set environment variables in Render dashboard:
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_DOMAIN`
   - `APP_DOMAIN`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
4. Deploy automatically on push

### Option C: AWS / DigitalOcean / Custom VPS

1. Set up server with Ruby, Rails, PostgreSQL
2. Clone repository
3. Create `.env` file with all variables
4. Run:
   ```bash
   bundle install
   rails db:create db:migrate db:seed
   rails assets:precompile
   ```
5. Configure Nginx/Apache
6. Set up SSL certificate (Let's Encrypt)
7. Start Rails server with Puma/Passenger

---

## 🔧 Step 6: Pre-Deployment Checklist

### Email Setup
- [ ] Gmail 2FA enabled
- [ ] App Password generated
- [ ] `EMAIL_USER` set to your Gmail address
- [ ] `EMAIL_PASS` set to 16-digit App Password
- [ ] `EMAIL_DOMAIN` set to your domain
- [ ] Logo exists at `public/imgs/logo.png`

### Application Setup
- [ ] `APP_DOMAIN` set to production domain
- [ ] `SECRET_KEY_BASE` generated and set
- [ ] Database configured and migrated
- [ ] Assets precompiled

### Stripe Setup
- [ ] Production Stripe account active
- [ ] `STRIPE_PUBLISHABLE_KEY` set (pk_live_...)
- [ ] `STRIPE_SECRET_KEY` set (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` set (whsec_...)
- [ ] Webhook endpoint configured on Stripe dashboard
- [ ] Test checkout flow in production

### Security
- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured
- [ ] No secrets in Git repository
- [ ] CORS configured if needed
- [ ] Rate limiting enabled

---

## 🧪 Step 7: Test Email Delivery

### Test Login Email

1. Go to your production site
2. Click "Login"
3. Enter an email address
4. Check inbox for verification code
5. Verify logo appears in email
6. Verify code works

### Test Order Confirmation Email

1. Add product to cart
2. Complete checkout with Stripe test card (if testing)
3. Check inbox for order confirmation
4. Verify logo appears
5. Verify all order details correct

### Troubleshooting Emails

If emails don't send:

1. **Check logs:**
   ```bash
   # Heroku
   heroku logs --tail
   
   # Custom server
   tail -f log/production.log
   ```

2. **Common issues:**
   - App Password incorrect (check for spaces)
   - 2FA not enabled on Gmail
   - `EMAIL_USER` doesn't match Gmail account
   - Gmail blocking sign-in attempts (check security alerts)
   - Firewall blocking port 587

3. **Verify SMTP connection:**
   ```bash
   # In Rails console
   rails c -e production
   
   # Test email
   UserMailer.verification_code(User.first).deliver_now
   ```

---

## 📊 Step 8: Monitor Email Delivery

### Gmail Monitoring

- Check Gmail account regularly for bounce-backs
- Monitor "Sent" folder to verify emails going out
- Watch for security alerts from Google

### Application Monitoring

- Monitor `log/production.log` for email errors
- Set up alerts for delivery failures
- Track email delivery success rate

### Rate Limiting

If you hit the 500/day limit:
- Upgrade to Google Workspace (2,000/day)
- Use alternative SMTP (Mailgun, SendGrid, Postmark)
- Implement email queuing/throttling

---

## 🔄 Step 9: Alternative SMTP Providers (If Needed)

If Gmail doesn't meet your needs, here are alternatives:

### Mailgun (Recommended for High Volume)
```ruby
config.action_mailer.smtp_settings = {
  address: 'smtp.mailgun.org',
  port: 587,
  domain: ENV['MAILGUN_DOMAIN'],
  user_name: ENV['MAILGUN_USERNAME'],
  password: ENV['MAILGUN_PASSWORD'],
  authentication: 'plain'
}
```

### SendGrid
```ruby
config.action_mailer.smtp_settings = {
  address: 'smtp.sendgrid.net',
  port: 587,
  domain: ENV['EMAIL_DOMAIN'],
  user_name: 'apikey',
  password: ENV['SENDGRID_API_KEY'],
  authentication: 'plain'
}
```

### Postmark
```ruby
config.action_mailer.delivery_method = :postmark
config.action_mailer.postmark_settings = {
  api_token: ENV['POSTMARK_API_TOKEN']
}
```

---

## 🎯 Step 10: Go Live!

Once everything is configured and tested:

1. **Final verification:**
   ```bash
   # Check environment variables
   heroku config  # or your platform's equivalent
   
   # Verify database
   heroku run rails db:migrate:status
   
   # Test critical paths
   # - User login
   # - Product viewing
   # - Add to cart
   # - Checkout
   # - Email delivery
   ```

2. **Deploy:**
   ```bash
   git push heroku main
   # or your platform's deployment command
   ```

3. **Monitor:**
   - Watch logs for errors
   - Test user flows
   - Verify emails sending
   - Check Stripe webhooks

4. **Celebrate! 🎉**
   - Your app is live!
   - Party hard with Kerfunkle!

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Emails not sending
- **Solution**: Check `EMAIL_USER` and `EMAIL_PASS` in environment variables
- **Solution**: Verify 2FA enabled and App Password correct
- **Solution**: Check Gmail security alerts

**Issue**: Logo not showing in emails
- **Solution**: Verify `public/imgs/logo.png` exists
- **Solution**: Check file permissions
- **Solution**: Ensure logo file is committed to Git

**Issue**: "Net::SMTPAuthenticationError"
- **Solution**: App Password incorrect or expired
- **Solution**: Regenerate App Password

**Issue**: "Net::OpenTimeout" or connection errors
- **Solution**: Check firewall/network settings
- **Solution**: Verify port 587 not blocked
- **Solution**: Test SMTP connection from server

### Getting Help

- Check Rails logs: `tail -f log/production.log`
- Check hosting platform logs
- Test SMTP connection in Rails console
- Verify all environment variables set correctly

---

## 🔒 Security Best Practices

1. **Rotate secrets regularly:**
   - Regenerate App Password every 90 days
   - Update Stripe keys if compromised
   - Rotate `SECRET_KEY_BASE` periodically

2. **Monitor access:**
   - Review Gmail account activity
   - Check Stripe dashboard for unusual activity
   - Monitor application logs

3. **Backup data:**
   - Regular database backups
   - Keep copy of environment variables (securely)
   - Document configuration

4. **SSL/HTTPS:**
   - Always use HTTPS in production
   - Enable HSTS
   - Use strong SSL ciphers

---

## 📚 Additional Resources

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Rails ActionMailer Guide](https://guides.rubyonrails.org/action_mailer_basics.html)
- [Stripe Production Checklist](https://stripe.com/docs/payments/checkout/production-checklist)
- [Heroku Rails Deployment](https://devcenter.heroku.com/articles/getting-started-with-rails7)

---

**Ready to deploy? You've got this! 🚀**

