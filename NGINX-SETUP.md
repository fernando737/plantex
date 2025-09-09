# Nginx Multi-Tenant Configuration Guide

This guide explains how to configure Nginx for the multi-tenant subdomain architecture.

## 🏗️ Architecture Overview

The application supports multiple tenants accessed via subdomains:
- `app.localhost:3000` → Public tenant/main application (development)
- `demo.localhost:3000` → Demo tenant (development)  
- `tenant1.localhost:3000` → Individual tenant (development)
- `app.yourdomain.com` → Public tenant/main application (production)
- `tenant1.yourdomain.com` → Individual tenant (production)
- `tenant2.yourdomain.com` → Individual tenant (production)

## 📁 Configuration Files

### Available Templates:
- `default.local.conf` - Development configuration (HTTP, *.localhost)
- `default.production.conf` - Production template (HTTPS, *.yourdomain.com)
- `default.conf` - Active configuration (copy from templates)

## 🔧 Setup Instructions

### For Local Development

1. **Copy the local template:**
   ```bash
   cp default.local.conf default.conf
   ```

2. **Restart nginx container:**
   ```bash
   docker-compose -f docker-compose-local.yml restart nginx
   ```

3. **Test subdomain access:**
   - Public tenant (main app): http://app.localhost:3000
   - Demo tenant: http://demo.localhost:3000
   - API: http://app.localhost:3000/api/ (or any subdomain)
   - Admin: http://app.localhost:3000/admin/

### For Production Deployment

1. **Copy the production template:**
   ```bash
   cp default.production.conf default.conf
   ```

2. **Replace domain placeholders:**
   ```bash
   # Replace 'yourdomain.com' with your actual domain
   sed -i 's/yourdomain.com/example.com/g' default.conf
   ```

3. **Configure DNS (Wildcard A Record):**
   ```
   Type: A
   Name: *.example.com
   Value: YOUR_SERVER_IP
   TTL: 300 (or your preferred value)
   ```

4. **Obtain SSL Certificate:**
   ```bash
   # Option 1: Using Certbot with nginx
   certbot --nginx -d example.com -d *.example.com
   
   # Option 2: Using Certbot with DNS (recommended for wildcards)
   certbot certonly --dns-cloudflare \
     --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini \
     -d example.com -d *.example.com
   ```

5. **Update SSL paths in default.conf:**
   ```nginx
   ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
   ```

6. **Restart containers:**
   ```bash
   docker-compose -f docker-compose-prod.yml restart nginx
   ```

## 🌐 DNS Configuration

### Development
No DNS configuration needed. Uses localhost subdomains.

### Production
Configure wildcard DNS record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | *.example.com | YOUR_SERVER_IP | 300 |
| A | example.com | YOUR_SERVER_IP | 300 |

## 🔒 SSL Certificate Requirements

### Development
- No SSL required (HTTP only)

### Production
- **Wildcard SSL certificate** required for `*.yourdomain.com`
- Covers all tenant subdomains automatically
- Recommended providers: Let's Encrypt, Cloudflare

### SSL Certificate Commands:

```bash
# Method 1: Manual DNS challenge (most reliable for wildcards)
certbot certonly --manual \
  --preferred-challenges dns \
  -d example.com -d *.example.com

# Method 2: Cloudflare DNS (if using Cloudflare)
certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini \
  -d example.com -d *.example.com

# Method 3: Nginx plugin (may not work with wildcards)
certbot --nginx -d example.com -d *.example.com
```

## 🔍 Testing Configuration

### Test Nginx Configuration:
```bash
# Test syntax
docker-compose exec nginx nginx -t

# Reload configuration
docker-compose exec nginx nginx -s reload
```

### Test Multi-Tenant Access:

**Development:**
```bash
curl -H "Host: app.localhost" http://localhost/api/health
curl -H "Host: demo.localhost" http://localhost/api/health
curl -H "Host: tenant1.localhost" http://localhost/api/health
```

**Production:**
```bash
curl https://app.example.com/api/health
curl https://demo.example.com/api/health  
curl https://tenant1.example.com/api/health
```

## 🚀 Key Features

### Multi-Tenant Support:
- ✅ Wildcard subdomain routing (`*.yourdomain.com`)
- ✅ Proper Host header forwarding to Django
- ✅ Same frontend serves all tenants
- ✅ Django resolves tenant from subdomain

### Performance:
- ✅ Static file caching (1 year for assets)
- ✅ Gzip compression
- ✅ HTTP/2 support (production)
- ✅ Proper buffer settings

### Security:
- ✅ HTTPS redirect (production)
- ✅ Security headers (HSTS, XSS protection, etc.)
- ✅ SSL/TLS optimization
- ✅ Admin interface security headers

## 🔧 Troubleshooting

### Common Issues:

1. **403 Forbidden on subdomains:**
   - Check that nginx has proper Host header forwarding
   - Verify Django tenant configuration

2. **SSL certificate errors:**
   - Ensure wildcard certificate covers all subdomains
   - Check certificate paths in nginx config

3. **Subdomain not resolving:**
   - Verify DNS wildcard record
   - Check firewall allows ports 80/443

4. **CORS errors in development:**
   - Development config includes CORS headers
   - Check frontend proxy configuration

### Debug Commands:

```bash
# Check nginx logs
docker-compose logs nginx

# Test nginx configuration
docker-compose exec nginx nginx -t

# Check SSL certificate
openssl x509 -in /etc/letsencrypt/live/example.com/fullchain.pem -text -noout

# Test DNS resolution
nslookup tenant1.example.com
dig *.example.com
```

## 📋 Deployment Checklist

### Development Setup:
- [ ] Copy `default.local.conf` to `default.conf`
- [ ] Restart nginx container
- [ ] Test http://app.localhost:3000 (public tenant/main app)
- [ ] Test http://demo.localhost:3000 (demo tenant)

### Production Setup:
- [ ] Copy `default.production.conf` to `default.conf`
- [ ] Replace `yourdomain.com` with actual domain
- [ ] Configure wildcard DNS (*.yourdomain.com)
- [ ] Obtain wildcard SSL certificate
- [ ] Update SSL paths in nginx config
- [ ] Test HTTPS access on subdomains
- [ ] Verify SSL certificate with SSLLabs

### Post-Deployment:
- [ ] Create production tenant: `python manage.py create_prod_tenant`
- [ ] Test tenant-specific URLs
- [ ] Monitor nginx and application logs
- [ ] Set up SSL renewal automation