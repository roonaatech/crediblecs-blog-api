-- ============================================
-- CredibleCS Blog - Seed Data
-- ============================================
-- Run after schema.sql to populate initial data.
-- Usage: mysql -u root -p crediblecs_blog < database/seed.sql
-- ============================================

USE crediblecs_blog;

-- ============================================
-- 1. SEED AUTHORS
-- ============================================
-- Default admin password: Admin@123 (bcrypt hash)
INSERT INTO authors (name, email, password_hash, slug, bio, designation, role, social_links) VALUES
(
  'admin',
  'admin@crediblecs.com',
  '$2a$12$BukHvop/r8yplax4V8d4GeOIN33mQzoh8MS5crIG5kceIHNumTl1e',
  'admin',
  'Admin',
  'Admin',
  'admin',
  '{"linkedin": "https://linkedin.com/in/crediblecs", "twitter": ""}'
),
(
  'CredibleCS Team',
  'team@crediblecs.com',
  '$2a$12$BukHvop/r8yplax4V8d4GeOIN33mQzoh8MS5crIG5kceIHNumTl1e',
  'crediblecs-team',
  'Expert team of compliance professionals at Credible Corporate Services Private Limited.',
  'Content Team',
  'editor',
  '{"linkedin": "https://linkedin.com/company/crediblecs"}'
);

-- ============================================
-- 2. SEED CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, description, display_order) VALUES
('Payroll Updates',     'payroll-updates',     'Latest news, tips, and best practices on payroll processing and management.',                     1),
('PF & ESI',            'pf-esi',              'Provident Fund registration, claims, ESI filings, and compliance insights.',                     2),
('Professional Tax',    'professional-tax',    'Professional Tax registration, filing deadlines, and state-wise guides.',                        3),
('Labour Law',          'labour-law',          'Labour Code 2025 changes, compliance requirements, and audit preparation guides.',               4),
('HR Best Practices',   'hr-best-practices',   'Human resource management tips, policies, and workplace culture insights.',                      5),
('Industry News',       'industry-news',       'Latest compliance industry updates, government notifications, and regulatory changes.',          6),
('Case Studies',        'case-studies',         'Real client success stories and compliance transformation journeys.',                            7),
('Guides & Tutorials',  'guides-tutorials',    'Step-by-step guides for PF registration, ESI filing, payroll setup, and more.',                  8);

-- ============================================
-- 3. SEED TAGS
-- ============================================
INSERT INTO tags (name, slug) VALUES
('PF Registration',       'pf-registration'),
('ESI Registration',      'esi-registration'),
('PF Return Filing',      'pf-return-filing'),
('ESI Return Filing',     'esi-return-filing'),
('Professional Tax',      'professional-tax'),
('Labour Welfare Fund',   'labour-welfare-fund'),
('Payroll Processing',    'payroll-processing'),
('TDS',                   'tds'),
('Form 16',               'form-16'),
('Minimum Wages',         'minimum-wages'),
('Labour Code 2025',      'labour-code-2025'),
('POSH Compliance',       'posh-compliance'),
('Factory License',       'factory-license'),
('Shops & Establishments','shops-and-establishments'),
('CLRA',                  'clra'),
('Gratuity',              'gratuity'),
('Full & Final Settlement','full-and-final-settlement'),
('Chennai',               'chennai'),
('Tamil Nadu',            'tamil-nadu'),
('Startup Compliance',    'startup-compliance'),
('HR Policies',           'hr-policies'),
('Employee Benefits',     'employee-benefits'),
('Compliance Audit',      'compliance-audit'),
('Penalty Avoidance',     'penalty-avoidance');

-- ============================================
-- 4. SEED SAMPLE BLOG POSTS
-- ============================================
INSERT INTO posts (
  title, slug, excerpt, content, content_format,
  meta_title, meta_description,
  featured_image_url, featured_image_alt,
  author_id, category_id, status, published_at,
  reading_time_minutes, word_count, is_featured
) VALUES
-- Post 1
(
  'Complete Guide to PF Registration in Chennai (2025)',
  'complete-guide-pf-registration-chennai-2025',
  'Everything you need to know about PF registration in Chennai — eligibility criteria, documents required, step-by-step process, and common mistakes to avoid.',
  '<h2>Why PF Registration Matters</h2><p>Provident Fund (PF) registration is mandatory for all establishments employing 20 or more employees under the Employees'' Provident Funds and Miscellaneous Provisions Act, 1952. In Chennai, with its booming IT corridor and manufacturing sector, ensuring timely PF registration is critical to avoid penalties of up to ₹5,000 per month of delay.</p><h2>Who Needs to Register?</h2><ul><li>Any establishment with 20+ employees</li><li>Factories (irrespective of employee count in some cases)</li><li>Establishments voluntarily opting for PF coverage</li></ul><h2>Documents Required</h2><ol><li>PAN Card of the establishment</li><li>Certificate of Incorporation / Partnership Deed</li><li>Address proof of the registered office</li><li>Bank account details and cancelled cheque</li><li>Digital Signature Certificate (DSC) of the authorized signatory</li><li>Aadhar cards of all employees</li></ol><h2>Step-by-Step Registration Process</h2><p>The entire PF registration process is now online through the EPFO Unified Portal. Here is the step-by-step process:</p><ol><li><strong>Visit the EPFO Portal</strong> — Go to unifiedportal-emp.epfindia.gov.in</li><li><strong>Establishment Registration</strong> — Click on "Establishment Registration" and fill in the details</li><li><strong>Upload Documents</strong> — Upload all required documents in the specified format</li><li><strong>DSC Verification</strong> — Sign the application using your DSC</li><li><strong>Submit and Track</strong> — Submit the application and note the reference number</li></ol><h2>Timeline</h2><p>Once submitted, EPFO typically processes the registration within 7-15 working days. You will receive your PF Establishment Code via email and on the portal.</p><h2>Common Mistakes to Avoid</h2><ul><li>Incorrect wage details leading to under-contribution</li><li>Not registering employees within 30 days of joining</li><li>Missing monthly ECR filing deadlines (15th of every month)</li><li>Incorrect KYC details for employees</li></ul><h2>How CredibleCS Can Help</h2><p>At CredibleCS, we handle the entire PF registration process end-to-end. From document preparation to EPFO coordination, we ensure your registration is completed within 7-15 days with zero errors. Contact us today for a free consultation.</p>',
  'html',
  'PF Registration in Chennai 2025 — Complete Guide | CredibleCS',
  'Step-by-step guide to PF registration in Chennai. Learn eligibility, documents required, online process, and avoid common mistakes. Expert help from CredibleCS.',
  '/images/pf-registration-guide.png',
  'PF Registration process in Chennai - step by step guide',
  1, 2, 'published', NOW() - INTERVAL 5 DAY,
  6, 1350, TRUE
),
-- Post 2
(
  'Labour Code 2025: 5 Changes Every Chennai Employer Must Know',
  'labour-code-2025-changes-chennai-employers',
  'The new Labour Codes effective from November 2025 bring significant changes to PF calculations, gratuity eligibility, and full & final settlement timelines.',
  '<h2>The New Labour Codes Are Here</h2><p>After years of deliberation, the four Labour Codes — Code on Wages, Code on Social Security, Industrial Relations Code, and Occupational Safety Code — are now effective from November 2025. These codes consolidate 29 existing labour laws into four streamlined codes.</p><h2>Top 5 Changes You Must Know</h2><h3>1. The 50% Wage Rule</h3><p>Under the new Code on Wages, basic salary must constitute at least 50% of the total CTC (Cost to Company). This directly impacts PF and gratuity calculations, potentially increasing the employer''s contribution significantly.</p><h3>2. Full & Final Settlement in 2 Working Days</h3><p>Employers are now required to complete full and final settlement within 2 working days of an employee''s last working day. This is a drastic reduction from the earlier practice of 30-45 days.</p><h3>3. Gratuity After 1 Year</h3><p>The gratuity eligibility threshold has been reduced from 5 years to 1 year for fixed-term employees. This means even contract workers on 1-year terms are now eligible for gratuity.</p><h3>4. Expanded Safety Compliance</h3><p>The Occupational Safety Code now applies to establishments with 10+ workers (previously 20+), bringing more businesses under its ambit.</p><h3>5. Social Security for Gig Workers</h3><p>For the first time, gig and platform workers are brought under the social security umbrella, requiring companies to contribute to a social security fund.</p><h2>What Should Chennai Employers Do?</h2><ul><li>Restructure salary components to comply with the 50% basic wage rule</li><li>Update HR policies for the 2-day FnF timeline</li><li>Recalculate gratuity provisions</li><li>Ensure all safety audits are up to date</li><li>Consult with a compliance expert to avoid penalties</li></ul><h2>Need Help Transitioning?</h2><p>CredibleCS specializes in helping Chennai businesses transition to the new Labour Codes. Our team will audit your current compliance status and create a roadmap for full compliance. Call us at +91 74015 65656 for a free gap analysis.</p>',
  'html',
  'Labour Code 2025 Changes for Chennai Employers | CredibleCS',
  '5 critical Labour Code 2025 changes every Chennai employer must know — 50% wage rule, 2-day FnF, gratuity changes, and more. Expert compliance guidance.',
  '/images/labour-code-2025.png',
  'Labour Code 2025 changes affecting Chennai businesses',
  1, 4, 'published', NOW() - INTERVAL 3 DAY,
  7, 1580, TRUE
),
-- Post 3
(
  'How We Helped a Guindy IT Company Reduce PF Penalties by 65%',
  'case-study-guindy-it-company-pf-penalty-reduction',
  'A real case study of how CredibleCS helped a 75-employee IT company in Guindy resolve PF non-compliance issues and achieve a 65% penalty reduction.',
  '<h2>The Challenge</h2><p>A mid-sized IT company in Guindy, Chennai, with 75 employees, approached CredibleCS after receiving a penalty notice from EPFO. The company had accumulated several months of unpaid PF contributions and missed ECR filings, resulting in a substantial penalty amount.</p><h2>Key Issues Identified</h2><ul><li>6 months of pending PF contributions</li><li>Missed ECR filings for 4 consecutive months</li><li>Incorrect employee KYC mappings</li><li>No proper compliance tracking system</li></ul><h2>Our Approach</h2><h3>Phase 1: Emergency Audit (Day 1-2)</h3><p>Our team conducted a comprehensive compliance audit within 48 hours, identifying every gap in their PF filing history and employee data.</p><h3>Phase 2: Rectification (Day 3-7)</h3><p>We prepared and filed all pending ECR returns, corrected KYC discrepancies, and computed the exact penalty liability with applicable interest.</p><h3>Phase 3: EPFO Coordination (Day 8-15)</h3><p>We liaised directly with the EPFO regional office, presenting the rectification steps taken and requesting penalty reduction based on the company''s corrective actions.</p><h2>The Result</h2><ul><li><strong>65% penalty reduction</strong> achieved through direct EPFO coordination</li><li>All pending contributions cleared within 10 working days</li><li>Full compliance restored with proper tracking in place</li><li>Monthly compliance management handed over to CredibleCS</li></ul><h2>Client Testimonial</h2><blockquote><p>"CredibleCS saved us lakhs in penalties and set up a system that ensures we never face this situation again. Their deep knowledge of EPFO processes made all the difference."</p><p>— IT Company Director, Guindy</p></blockquote><h2>Prevent This From Happening to You</h2><p>Don''t wait for a penalty notice. Contact CredibleCS today for a free compliance gap analysis.</p>',
  'html',
  'Case Study: 65% PF Penalty Reduction for Guindy IT Company | CredibleCS',
  'Real case study: How CredibleCS helped a 75-employee Guindy IT company reduce PF penalties by 65% through expert EPFO coordination and compliance management.',
  '/images/case-study-guindy.png',
  'CredibleCS case study - PF penalty reduction for Guindy IT company',
  1, 7, 'published', NOW() - INTERVAL 1 DAY,
  5, 1120, FALSE
),
-- Post 4 (Draft)
(
  'ESI Registration Made Easy: A Step-by-Step Guide for Chennai Startups',
  'esi-registration-guide-chennai-startups',
  'Complete guide to ESI registration for Chennai startups — eligibility, documents, online process, and benefits for employees earning up to ₹21,000/month.',
  '<h2>What is ESI?</h2><p>The Employee State Insurance (ESI) scheme provides medical, cash, maternity, disability, and dependent benefits to employees earning up to ₹21,000 per month. It is mandatory for establishments with 10 or more employees.</p><h2>Coming Soon</h2><p>This comprehensive guide is currently being prepared by our compliance team. Stay tuned for the complete walkthrough.</p>',
  'html',
  'ESI Registration Guide for Chennai Startups | CredibleCS',
  'Step-by-step ESI registration guide for Chennai startups. Learn eligibility, benefits, and the online registration process.',
  '/images/esi-registration-guide.png',
  'ESI Registration guide for Chennai startups',
  2, 2, 'draft', NULL,
  2, 450, FALSE
);

-- ============================================
-- 5. SEED POST_TAGS (link posts to tags)
-- ============================================
-- Post 1 (PF Registration Guide) tags
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1),   -- PF Registration
(1, 3),   -- PF Return Filing
(1, 18),  -- Chennai
(1, 20),  -- Startup Compliance
(1, 24);  -- Penalty Avoidance

-- Post 2 (Labour Code 2025) tags
INSERT INTO post_tags (post_id, tag_id) VALUES
(2, 11),  -- Labour Code 2025
(2, 16),  -- Gratuity
(2, 17),  -- Full & Final Settlement
(2, 18),  -- Chennai
(2, 10);  -- Minimum Wages

-- Post 3 (Case Study) tags
INSERT INTO post_tags (post_id, tag_id) VALUES
(3, 1),   -- PF Registration
(3, 3),   -- PF Return Filing
(3, 18),  -- Chennai
(3, 23),  -- Compliance Audit
(3, 24);  -- Penalty Avoidance

-- Post 4 (ESI Guide - draft) tags
INSERT INTO post_tags (post_id, tag_id) VALUES
(4, 2),   -- ESI Registration
(4, 18),  -- Chennai
(4, 20);  -- Startup Compliance
