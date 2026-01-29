# Scribl.li Landing Page

A modern, responsive landing page for Scribl.li - an open source document signing platform inspired by Documenso.

## Features

- 🎨 Modern design with Tailwind CSS
- 📱 Fully responsive layout
- ✨ Smooth animations and transitions
- 🚀 Optimized performance
- 💼 Contact form with PHP backend
- 📧 Newsletter subscription
- 🌙 Dark mode support
- ♿ Accessibility compliant

## Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Interactive features
- **PHP** - Backend form handling
- **Font Awesome** - Icons
- **AOS** - Animate On Scroll library

## File Structure

```
scriblli-landing/
├── index.html          # Main landing page
├── contact.php         # PHP form handler
├── css/
│   └── styles.css      # Custom styles
├── js/
│   └── main.js         # JavaScript functionality
├── assets/
│   └── images/         # Image assets
├── README.md           # This file
└── .htaccess           # Apache configuration (optional)
```

## Setup Instructions

### 1. Local Development

Simply open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using PHP
php -S localhost:8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then visit `http://localhost:8000`

### 2. Production Deployment

#### Apache Server

1. Upload all files to your web server
2. Ensure PHP is installed and configured
3. Set proper permissions:
   ```bash
   chmod 755 . -R
   chmod 644 contact.php
   ```

#### Nginx Server

1. Configure Nginx to serve PHP files
2. Update your server block:
   ```nginx
   server {
       listen 80;
       server_name scriblli.com;
       root /var/www/scriblli-landing;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       
       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
           fastcgi_index index.php;
           include fastcgi_params;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
       }
   }
   ```

### 3. Configuration

#### Contact Form

Edit `contact.php` to configure:

```php
// Line 8: Update recipient email
$toEmail = 'your-email@scriblli.com';

// Line 9: Update sender email
$fromEmail = 'noreply@scriblli.com';
```

#### Email Server

Ensure your server is configured to send emails. You may need to:

1. Install and configure Postfix/Sendmail
2. Use SMTP relay (recommended for production)
3. Consider using a service like SendGrid or Mailgun

Example SMTP configuration for PHP (add to contact.php):

```php
// Using PHPMailer with SMTP
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$mail = new PHPMailer();
$mail->isSMTP();
$mail->Host = 'smtp.scriblli.com';
$mail->SMTPAuth = true;
$mail->Username = 'your-email@scriblli.com';
$mail->Password = 'your-password';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;
```

## Customization

### Branding

Update the following in `index.html`:

- Line 10: Update title and meta description
- Line 38: Update company name in navigation
- Line 447: Update footer copyright

### Colors

The primary color is indigo (`#6366f1`). To change it:

1. Update Tailwind config or use custom CSS
2. Search and replace `indigo-600`, `text-indigo-600` etc. with your preferred color

### Content

All text content is in `index.html`. Update sections:

- Hero section (lines 65-85)
- Features (lines 200-250)
- Testimonials (lines 170-190)
- Why Choose Us (lines 280-330)

## SEO Optimization

The page includes:

- Semantic HTML5 tags
- Meta descriptions
- Open Graph tags (add as needed)
- Structured data (add as needed)

To add Open Graph tags:

```html
<meta property="og:title" content="Scribl.li - Open Source Document Signing">
<meta property="og:description" content="Sign everywhere with Scribl.li">
<meta property="og:image" content="https://scriblli.com/og-image.jpg">
<meta property="og:url" content="https://scriblli.com">
```

## Analytics

Add your analytics code before the closing `</body>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Security

- Input sanitization in PHP
- CSRF protection (add as needed)
- Rate limiting (implement as needed)
- HTTPS enforcement (add to .htaccess)

Add to `.htaccess` for HTTPS:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Performance

- Images are optimized (use WebP format)
- CSS/JS minified (for production)
- Lazy loading enabled
- CDN resources used

To minify CSS/JS for production:

```bash
# Using minifier
npx clean-css-cli -o css/styles.min.css css/styles.css
npx terser js/main.js -o js/main.min.js
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support:

- Email: support@scriblli.com
- GitHub Issues: [Create an issue](https://github.com/scriblli/scriblli-landing/issues)
- Documentation: [docs.scriblli.com](https://docs.scriblli.com)

## Roadmap

- [ ] Blog integration
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] A/B testing framework
- [ ] CMS integration
- [ ] E-commerce features
