import { PrismaClient } from '@documenso/prisma';

const prisma = new PrismaClient();

const blogCategories = [
  {
    name: 'Security',
    slug: 'security',
    description: 'Posts about security and compliance',
  },
  {
    name: 'Efficiency',
    slug: 'efficiency',
    description: 'Posts about improving business efficiency',
  },
  {
    name: 'Integration',
    slug: 'integration',
    description: 'Posts about API and system integrations',
  },
  {
    name: 'Legal',
    slug: 'legal',
    description: 'Posts about legal aspects of e-signatures',
  },
  {
    name: 'Remote Work',
    slug: 'remote-work',
    description: 'Posts about remote document workflows',
  },
  {
    name: 'Analytics',
    slug: 'analytics',
    description: 'Posts about metrics and analytics',
  },
  {
    name: 'Industry Trends',
    slug: 'industry-trends',
    description: 'Posts about industry news and trends',
  },
];

export async function seedBlogCategories() {
  console.log('🌱 Seeding blog categories...');

  for (const category of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log('✅ Blog categories seeded successfully');
}

// Sample blog posts
const sampleBlogPosts = [
  {
    title: 'The Future of Digital Signatures: Trends to Watch in 2026',
    slug: 'future-digital-signatures-2026',
    excerpt:
      'Explore the latest trends shaping the e-signature industry, from AI-powered authentication to blockchain-based verification systems.',
    content: `# The Future of Digital Signatures: Trends to Watch in 2026

The digital signature landscape is evolving rapidly, driven by technological advancements and changing business needs. As we move through 2026, several key trends are reshaping how organizations approach document signing and authentication.

## 1. AI-Powered Authentication

Artificial intelligence is revolutionizing digital signatures by enhancing security and user experience. AI algorithms can now analyze signing patterns, detect anomalies, and provide real-time fraud detection. This technology enables more sophisticated biometric authentication methods that go beyond traditional signatures.

Machine learning models can verify the authenticity of signatures by comparing them against historical data, identifying subtle patterns that might indicate fraudulent activity. This makes digital signatures more secure than ever before.

## 2. Blockchain Integration

Blockchain technology is providing unprecedented levels of security and transparency for digital signatures. By storing signature data on a distributed ledger, organizations can create immutable audit trails that are virtually impossible to tamper with.

Smart contracts are automating signature workflows, triggering actions automatically when documents are signed. This reduces manual intervention and speeds up business processes significantly.

## 3. Zero-Knowledge Proofs

Privacy concerns are driving the adoption of zero-knowledge proofs in digital signatures. This cryptographic method allows parties to verify the authenticity of signatures without revealing any underlying information, providing an unprecedented level of privacy.

## 4. Quantum-Resistant Cryptography

With the advent of quantum computing, the digital signature industry is preparing for the future by implementing quantum-resistant cryptographic algorithms. These new methods ensure that signatures will remain secure even as quantum computers become more powerful.

## 5. Cross-Platform Interoperability

Standardization efforts are leading to better interoperability between different digital signature platforms. This means organizations can use multiple providers without worrying about compatibility issues, creating a more flexible and competitive market.

## Conclusion

The future of digital signatures is exciting, with technologies like AI, blockchain, and quantum-resistant cryptography pushing the boundaries of what's possible. Organizations that stay ahead of these trends will be better positioned to leverage digital signatures for competitive advantage.

At Scrib.li, we're committed to incorporating these advancements into our platform, ensuring our customers always have access to the latest and most secure digital signature technologies.`,
    author: 'Scrib.li Team',
    authorEmail: 'team@scriblli.com',
    readTime: 5,
    featured: true,
    metaTitle: 'The Future of Digital Signatures: Trends to Watch in 2026',
    metaDescription:
      'Explore the latest trends shaping the e-signature industry, from AI-powered authentication to blockchain-based verification systems.',
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-01-29T10:00:00Z'),
    categorySlug: 'industry-trends',
  },
  {
    title: 'How Secure Are Electronic Signatures? A Deep Dive',
    slug: 'electronic-signatures-security',
    excerpt:
      'Understanding the security measures that protect your electronically signed documents.',
    content: `# How Secure Are Electronic Signatures? A Deep Dive

In today's digital world, security is paramount. When it comes to electronic signatures, organizations need assurance that their documents are protected by robust security measures. Let's dive deep into the security features that make electronic signatures a trusted solution for businesses worldwide.

## Encryption Standards

Electronic signatures employ industry-standard encryption protocols to protect document integrity. Most platforms use AES-256 encryption for data at rest and TLS 1.3 for data in transit, ensuring that documents are protected from unauthorized access.

## Authentication Methods

Modern e-signature solutions offer multiple layers of authentication:

1. **Email Authentication**: Basic verification through email links
2. **Two-Factor Authentication**: Additional security through SMS or authenticator apps
3. **Biometric Authentication**: Fingerprint or facial recognition for mobile devices
4. **Knowledge-Based Authentication**: Security questions and personal information verification

## Audit Trails

Comprehensive audit trails are a cornerstone of e-signature security. These logs capture:
- Timestamps for every action
- IP addresses of signers
- Device information
- Document access history
- Signature verification details

## Legal Compliance

Electronic signatures are legally binding in most countries, backed by regulations such as:
- ESIGN Act (United States)
- eIDAS Regulation (European Union)
- PIPEDA (Canada)
- Electronic Transactions Act (Australia)

## Conclusion

Electronic signatures provide security that often exceeds traditional paper-based processes. With multiple layers of protection, comprehensive audit trails, and legal compliance, they offer a secure and trusted solution for modern business needs.`,
    author: 'Security Team',
    authorEmail: 'security@scriblli.com',
    readTime: 7,
    featured: false,
    metaTitle: 'How Secure Are Electronic Signatures? A Deep Dive',
    metaDescription:
      'Understanding the security measures that protect your electronically signed documents.',
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-01-25T14:00:00Z'),
    categorySlug: 'security',
  },
  {
    title: '5 Ways E-Signatures Transform Your Business Workflow',
    slug: 'transform-business-workflow',
    excerpt:
      'Discover how digital signatures can streamline your processes and boost productivity.',
    content: `# 5 Ways E-Signatures Transform Your Business Workflow

In the digital age, efficiency is key to business success. Electronic signatures have emerged as a powerful tool for streamlining workflows and reducing operational overhead. Here are five ways e-signatures can transform your business processes.

## 1. Accelerated Document Turnaround

Traditional signature processes can take days or weeks. With e-signatures, documents can be signed in minutes. This acceleration impacts:
- Sales contracts close faster
- Onboarding processes complete quicker
- Vendor approvals happen in real-time
- Legal documents execute immediately

## 2. Cost Reduction

The savings from implementing e-signatures are substantial:
- Reduced printing costs (paper, ink, maintenance)
- Eliminated shipping expenses
- Lower storage requirements
- Decreased administrative overhead

## 3. Enhanced Compliance

E-signature solutions provide built-in compliance features:
- Automatic regulatory compliance checks
- Standardized signature processes
- Complete audit documentation
- Tamper-evident seals

## 4. Improved Customer Experience

Modern customers expect digital convenience:
- Sign from anywhere, any device
- No need for printing or scanning
- Clear, guided signing process
- Immediate document access

## 5. Better Data Management

Digital signatures integrate seamlessly with business systems:
- Automatic data extraction
- Integration with CRM and ERP systems
- Real-time status tracking
- Centralized document storage

## Conclusion

Electronic signatures are more than just a digital alternative to wet signatures—they're a business transformation tool. By adopting e-signatures, organizations can achieve significant efficiency gains, cost savings, and competitive advantages in today's fast-paced business environment.`,
    author: 'Product Team',
    authorEmail: 'product@scriblli.com',
    readTime: 4,
    featured: false,
    metaTitle: '5 Ways E-Signatures Transform Your Business Workflow',
    metaDescription:
      'Discover how digital signatures can streamline your processes and boost productivity.',
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-01-22T11:00:00Z'),
    categorySlug: 'efficiency',
  },
];

export async function seedBlogPosts() {
  console.log('🌱 Seeding blog posts...');

  for (const post of sampleBlogPosts) {
    // Find the category ID
    const category = await prisma.blogCategory.findUnique({
      where: { slug: post.categorySlug },
    });

    if (!category) {
      console.warn(`⚠️ Category not found for slug: ${post.categorySlug}`);
      continue;
    }

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        authorEmail: post.authorEmail,
        readTime: post.readTime,
        featured: post.featured,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        status: post.status,
        publishedAt: post.publishedAt,
        categoryId: category.id,
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        authorEmail: post.authorEmail,
        readTime: post.readTime,
        featured: post.featured,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        status: post.status,
        publishedAt: post.publishedAt,
        categoryId: category.id,
      },
    });
  }

  console.log('✅ Blog posts seeded successfully');
}
