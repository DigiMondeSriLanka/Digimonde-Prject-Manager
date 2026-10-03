-- =====================================================================
-- Digimonde Project Management — sample data
-- All dates are relative to current_date so the demo always looks live.
-- =====================================================================

-- ---------- Team ----------
insert into public.employees (id, name, email, phone, role_title, department, skill_area, availability_pct, available_hours, employment_status, join_date, performance_notes) values
('EMP-001', 'Amara Perera',          'amara@digimonde.com',   '+94 77 100 0001', 'CEO & Founder',               'Management', 'Strategy, Fundraising',         60, 80, 'Active', current_date - 900, 'Leads investor relations and product vision.'),
('EMP-002', 'Daniel Brooks',         'daniel@digimonde.com',  '+94 77 100 0002', 'CTO',                         'SD',         'Architecture, Node.js, AWS',    70, 80, 'Active', current_date - 880, 'Strong technical leadership; mentoring 3 engineers.'),
('EMP-003', 'Nisha Fernando',        'nisha@digimonde.com',   '+94 77 100 0003', 'Senior Project Manager',      'Management', 'Agile, Scrum, Client Delivery', 100, 80, 'Active', current_date - 640, 'Consistently delivers on time. PMP certified.'),
('EMP-004', 'Kavindu Silva',         'kavindu@digimonde.com', '+94 77 100 0004', 'Senior Full-Stack Developer', 'SD',         'React, Node.js, PostgreSQL',    100, 80, 'Active', current_date - 610, 'Top performer Q2. Watch workload — currently on 3 critical streams.'),
('EMP-005', 'Sophie Martin',         'sophie@digimonde.com',  '+94 77 100 0005', 'Frontend Developer',          'Web',        'React, Tailwind, Accessibility', 100, 80, 'Active', current_date - 420, 'Great UI polish; improving test coverage.'),
('EMP-006', 'Ravi Jayasuriya',       'ravi@digimonde.com',    '+94 77 100 0006', 'Mobile Developer',            'SD',         'React Native, Swift, Kotlin',   100, 80, 'Active', current_date - 380, 'Shipped 2 apps to store this year.'),
('EMP-007', 'Leah Kim',              'leah@digimonde.com',    '+94 77 100 0007', 'Lead UI/UX Designer',         'Web',        'Figma, Design Systems, Research', 100, 80, 'Active', current_date - 500, 'Over-allocated across 5 projects — consider hiring a 2nd designer.'),
('EMP-008', 'Omar Haddad',           'omar@digimonde.com',    '+94 77 100 0008', 'QA Engineer',                 'SD',         'Cypress, Playwright, Manual QA', 100, 80, 'Active', current_date - 300, 'Introduced automated regression suite.'),
('EMP-009', 'Ishara Wickramasinghe', 'ishara@digimonde.com',  '+94 77 100 0009', 'Digital Marketing Lead',      'DM',         'Performance Marketing, SEO',    100, 80, 'Active', current_date - 450, 'Grew client retainers by 40% YoY.'),
('EMP-010', 'Ben Carter',            'ben@digimonde.com',     '+94 77 100 0010', 'Content Strategist',          'DM',         'Copywriting, LinkedIn, Blogs',  100, 80, 'Active', current_date - 260, 'Excellent writing quality.'),
('EMP-011', 'Maya Gunawardena',      'maya@digimonde.com',    '+94 77 100 0011', 'Social Media Executive',      'DM',         'Instagram, TikTok, Meta Ads',   100, 80, 'Active', current_date - 200, 'Fast learner; owns 2 client accounts.'),
('EMP-012', 'Lucas Moreau',          'lucas@digimonde.com',   '+94 77 100 0012', 'Video Producer',              'Media',      'Premiere Pro, After Effects',   80, 80, 'Active', current_date - 330, 'Part-time Fridays.'),
('EMP-013', 'Hiruni Bandara',        'hiruni@digimonde.com',  '+94 77 100 0013', 'Operations & HR Manager',     'Operations', 'Recruitment, HR Ops, Compliance', 100, 80, 'Active', current_date - 700, 'Leading the hiring expansion.'),
('EMP-014', 'Ethan Wright',          'ethan@digimonde.com',   '+94 77 100 0014', 'Finance Manager',             'Finance',    'FP&A, Investor Reporting',      100, 80, 'Active', current_date - 350, 'Built the 3-year financial model.'),
('EMP-015', 'Dilan Rathnayake',      'dilan@digimonde.com',   '+94 77 100 0015', 'DevOps Engineer',             'SD',         'Kubernetes, CI/CD, Terraform',  100, 80, 'On Leave', current_date - 150, 'On leave until next week.');

-- ---------- Clients ----------
insert into public.clients (id, company_name, contact_person, phone, email, country, service_type, project_name, contract_value, start_date, end_date, status, project_manager, notes) values
('CLI-001', 'Northwind Retail',     'Jessica Hale',     '+1 415 555 0182',  'jessica@northwind.com',   'United States',  'Web Development',      'Northwind E-commerce Website',     38000, current_date - 120, current_date - 30,  'Completed', 'EMP-003', 'Upsell opportunity: festive ads retainer.'),
('CLI-002', 'Ceylon Spice Co.',     'Ruwan Dissanayake', '+94 11 255 0199', 'ruwan@ceylonspice.lk',    'Sri Lanka',      'Digital Marketing',    'Social Media Management',          14400, current_date - 200, current_date + 165, 'Active',    'EMP-009', 'Monthly retainer, 30 posts / month.'),
('CLI-003', 'BlueOcean Logistics',  'Wei Lin Tan',       '+65 6555 0143',   'weilin@blueocean.sg',     'Singapore',      'Software Development', 'Fleet Tracking Portal',            72000, current_date - 40,  current_date + 50,  'Active',    'EMP-003', 'Milestone billing: 30 / 40 / 30.'),
('CLI-004', 'Helix Fitness',        'Oliver Grant',      '+44 20 7946 0321', 'oliver@helixfitness.co.uk', 'United Kingdom', 'Media Production',  'Brand Video Series',               18500, current_date - 25,  current_date + 30,  'On Hold',   'EMP-012', 'Paused until new gym location opens.'),
('CLI-005', 'GreenLeaf Organics',   'Chloe Nguyen',      '+61 2 5550 1234', 'chloe@greenleaf.com.au',  'Australia',      'Digital Marketing',    'Instagram & TikTok Growth',        9600,  current_date - 60,  current_date + 300, 'Active',    'EMP-009', '24 posts / month, short-form video focus.'),
('CLI-006', 'Atlas Ventures',       'Khalid Al Mansoori', '+971 4 555 0177', 'khalid@atlasvc.ae',      'United Arab Emirates', 'Consulting',   'Digital Transformation Advisory',  25000, current_date + 20,  current_date + 140, 'Lead',      'EMP-001', 'Proposal sent; decision expected this month.');

-- ---------- Project master database — Dev ----------
insert into public.projects_dev (id, name, description, department, owner_id, manager_id, client_id, objective, priority, status, start_date, target_date, actual_date, budget, risk_level, dependencies, notes) values
('PRJ-001', 'MVP Product Development',        'Build the first market-ready version of the Digimonde SaaS platform.',          'SD',    'EMP-001', 'EMP-003', null,      'Validate product-market fit with 50 beta customers', 'Critical', 'Development', current_date - 60,  current_date + 25, null,               45000, 'Medium',  null,                         'Weekly demo every Friday.'),
('PRJ-002', 'Mobile Application Launch',      'iOS & Android companion app for the platform.',                                 'SD',    'EMP-002', 'EMP-003', null,      'Reach 5,000 app installs in first quarter',          'High',     'Testing',     current_date - 45,  current_date + 5,  null,               28000, 'High',    'PRJ-001 — core API',         'Store review can take up to 7 days.'),
('PRJ-003', 'Marketing Growth Campaign',      'Integrated paid + organic campaign for the product launch.',                    'Media', 'EMP-001', 'EMP-009', null,      'Generate 2,000 qualified leads',                     'High',     'Launch',      current_date - 30,  current_date - 3,  null,               15000, 'Medium',  'PRJ-001 — launch date',      'Launch video slipped; deadline missed.'),
('PRJ-004', 'Customer Acquisition Program',   'Outbound + referral engine to acquire first paying customers.',                 'Other', 'EMP-001', 'EMP-003', null,      'Acquire 100 paying customers at CAC < $120',         'Medium',   'Research',    current_date - 10,  current_date + 60, null,               12000, 'Low',     'PRJ-003 — lead flow',        null),
('PRJ-005', 'Fundraising Preparation',        'Prepare seed-round materials, data room and investor pipeline.',                'Other', 'EMP-001', 'EMP-014', null,      'Close a $1.5M seed round',                           'Critical', 'Development', current_date - 20,  current_date + 40, null,               6000,  'High',    'PRJ-001 — traction metrics', 'Target first investor meetings in 3 weeks.'),
('PRJ-006', 'Hiring Expansion Plan',          'Scale the team from 15 to 30 over the next 12 months.',                         'Other', 'EMP-013', 'EMP-013', null,      'Hire 6 key roles this quarter',                      'Medium',   'Planning',    current_date + 5,   current_date + 90, null,               20000, 'Medium',  'PRJ-005 — funding',          null),
('PRJ-007', 'Northwind E-commerce Website',   'Headless Shopify storefront with custom product configurator.',                 'Web',   'EMP-002', 'EMP-003', 'CLI-001', 'Deliver client site on time and on budget',          'High',     'Completed',   current_date - 120, current_date - 30, current_date - 32,  38000, 'Low',     null,                         'Delivered 2 days early.'),
('PRJ-008', 'BlueOcean Fleet Tracking Portal','Real-time fleet tracking web portal and driver check-in app.',                   'SD',    'EMP-002', 'EMP-003', 'CLI-003', 'Deliver milestone 2 for client sign-off',            'High',     'Development', current_date - 40,  current_date + 50, null,               72000, 'Medium',  'Mapbox licence',             null),
('PRJ-009', 'Helix Fitness Brand Video Series','6-episode brand video series for Helix Fitness.',                              'Media', 'EMP-001', 'EMP-012', 'CLI-004', 'Deliver 6 episodes for client campaign',             'Medium',   'On Hold',     current_date - 25,  current_date + 30, null,               18500, 'High',    'Client — venue availability', 'On hold by client.');

-- ---------- Project master database — DM ----------
insert into public.projects_dm (id, name, description, client_id, owner_id, manager_id, handler_id, priority, status, start_date, posts_per_month, published_posts, risk_level, notes) values
('DM-001', 'Ceylon Spice Co. — Social Media Management', 'Facebook + Instagram content, community management and boosting.', 'CLI-002', 'EMP-009', 'EMP-009', 'EMP-011', 'High',   'Active',    current_date - 200, 30, 22, 'Low',    'Engagement up 18% MoM.'),
('DM-002', 'GreenLeaf Organics — Instagram & TikTok',     'Short-form video and reels-led growth campaign.',                   'CLI-005', 'EMP-009', 'EMP-009', 'EMP-010', 'High',   'Active',    current_date - 60,  24, 9,  'Medium', 'Behind schedule — waiting on product shoot.'),
('DM-003', 'Digimonde — LinkedIn Thought Leadership',     'Founder-led LinkedIn content and company page growth.',             null,      'EMP-001', 'EMP-009', 'EMP-010', 'Medium', 'Active',    current_date - 90,  12, 10, 'Low',    null),
('DM-004', 'Helix Fitness — YouTube Shorts',              'Repurpose brand video series into Shorts.',                         'CLI-004', 'EMP-009', 'EMP-012', 'EMP-012', 'Medium', 'Inactive',   current_date - 25,  16, 4,  'High',   'Depends on PRJ-009 footage.'),
('DM-005', 'Northwind Retail — Festive Season Ads',       'Paid social creatives for the festive sale.',                        'CLI-001', 'EMP-009', 'EMP-009', 'EMP-011', 'Low',    'Inactive', current_date - 45,  20, 20, 'Low',    'ROAS 4.2x.');

-- ---------- Tasks ----------
insert into public.tasks (project_id, name, description, category, assigned_to, owner_id, priority, status, start_date, due_date, completion_date, estimated_hours, risk, comments) values
-- PRJ-001 MVP
('PRJ-001', 'Define MVP feature scope & user stories', 'Prioritised backlog with acceptance criteria.', 'Management', '{EMP-003,EMP-001}', 'EMP-003', 'Critical', 'Completed',   current_date - 60, current_date - 50, current_date - 51, 16, 'Low',    null),
('PRJ-001', 'System architecture & database design',   'Multi-tenant Postgres schema, API design.',    'Development','{EMP-002,EMP-004}', 'EMP-002', 'Critical', 'Completed',   current_date - 55, current_date - 42, current_date - 43, 24, 'Low',    null),
('PRJ-001', 'UI/UX wireframes & design system',        'Figma components, tokens and key screens.',    'Design',     '{EMP-007}',         'EMP-003', 'High',     'Completed',   current_date - 50, current_date - 35, current_date - 36, 40, 'Low',    null),
('PRJ-001', 'Authentication & user management API',    'Email/SSO login, roles and invitations.',      'Development','{EMP-004}',         'EMP-002', 'High',     'Completed',   current_date - 40, current_date - 25, current_date - 24, 32, 'Low',    'Merged after security review.'),
('PRJ-001', 'Core dashboard frontend',                 'Main analytics dashboard and navigation.',     'Development','{EMP-005,EMP-007}', 'EMP-003', 'High',     'In Progress', current_date - 25, current_date + 6,  null,              48, 'Medium', '70% done; charts remaining.'),
('PRJ-001', 'Payments integration (Stripe)',           'Subscriptions, invoices and webhooks.',        'Development','{EMP-004}',         'EMP-002', 'Critical', 'In Progress', current_date - 15, current_date + 2,  null,              30, 'High',   'Waiting on merchant account verification.'),
('PRJ-001', 'CI/CD pipeline & staging environment',    'GitHub Actions, preview deploys, staging DB.', 'DevOps',     '{EMP-015}',         'EMP-002', 'Medium',   'Review',      current_date - 12, current_date + 4,  null,              12, 'Low',    null),
('PRJ-001', 'End-to-end QA test plan',                 'Critical user journeys + regression suite.',   'QA',         '{EMP-008}',         'EMP-003', 'Medium',   'Assigned',    current_date - 2,  current_date + 15, null,              20, 'Low',    null),
('PRJ-001', 'Beta user onboarding flow',               'Guided setup, sample data and tooltips.',      'Design',     '{EMP-007,EMP-005}', 'EMP-003', 'Medium',   'Backlog',     current_date + 5,  current_date + 20, null,              18, 'Low',    null),
-- PRJ-002 Mobile
('PRJ-002', 'React Native app shell & navigation',     'Project setup, theming, navigation stack.',    'Development','{EMP-006}',         'EMP-002', 'High',     'Completed',   current_date - 45, current_date - 35, current_date - 36, 30, 'Low',    null),
('PRJ-002', 'Push notifications service',              'FCM/APNs integration and preferences.',        'Development','{EMP-006,EMP-015}', 'EMP-002', 'High',     'In Progress', current_date - 20, current_date - 2,  null,              16, 'High',   'FCM credentials pending from client admin.'),
('PRJ-002', 'Offline sync',                            'Local cache and conflict resolution.',         'Development','{EMP-006,EMP-004}', 'EMP-002', 'High',     'Testing',     current_date - 18, current_date + 3,  null,              28, 'Medium', null),
('PRJ-002', 'App store listing assets & screenshots',  'Store screenshots, preview video, copy.',      'Design',     '{EMP-007,EMP-012}', 'EMP-003', 'Medium',   'In Progress', current_date - 7,  current_date + 4,  null,              10, 'Low',    null),
('PRJ-002', 'iOS & Android regression testing',        'Device matrix testing on 12 devices.',         'QA',         '{EMP-008}',         'EMP-003', 'High',     'Testing',     current_date - 5,  current_date + 5,  null,              24, 'Medium', null),
('PRJ-002', 'App Store / Play Store submission',       'Build signing, metadata, review submission.',  'DevOps',     '{EMP-006}',         'EMP-002', 'Critical', 'Backlog',     current_date + 3,  current_date + 6,  null,              6,  'Medium', null),
-- PRJ-003 Marketing Growth
('PRJ-003', 'Campaign strategy & KPI framework',       'Channels, budget split, funnel KPIs.',         'Marketing',  '{EMP-009}',         'EMP-009', 'High',     'Completed',   current_date - 30, current_date - 24, current_date - 25, 12, 'Low',    null),
('PRJ-003', 'Landing page A/B variants',               'Two hero variants with tracking.',             'Development','{EMP-005}',         'EMP-009', 'Medium',   'Completed',   current_date - 24, current_date - 12, current_date - 13, 20, 'Low',    null),
('PRJ-003', 'Launch video (60s) production',           'Script, shoot, edit and colour grade.',        'Content',    '{EMP-012,EMP-010}', 'EMP-009', 'High',     'In Progress', current_date - 20, current_date - 4,  null,              36, 'High',   'Reshoot scheduled for next week.'),
('PRJ-003', 'Paid social ad creatives',                '12 static + 4 video ad variants.',             'Design',     '{EMP-007,EMP-011}', 'EMP-009', 'High',     'Review',      current_date - 10, current_date - 1,  null,              14, 'Medium', null),
('PRJ-003', 'Influencer partnership outreach',         'Shortlist and contract 10 micro-influencers.', 'Marketing',  '{EMP-009,EMP-011}', 'EMP-009', 'Medium',   'Blocked',     current_date - 12, current_date + 2,  null,              10, 'High',   'Budget approval pending from finance.'),
-- PRJ-004 Customer Acquisition
('PRJ-004', 'ICP & persona research',                  '20 customer interviews and synthesis.',        'Research',   '{EMP-009,EMP-003}', 'EMP-003', 'High',     'Completed',   current_date - 10, current_date - 3,  current_date - 4,  12, 'Low',    null),
('PRJ-004', 'CRM setup & lead scoring',                'HubSpot pipelines, lead scoring rules.',       'Other',      '{EMP-013}',         'EMP-003', 'Medium',   'In Progress', current_date - 5,  current_date + 10, null,              16, 'Low',    null),
('PRJ-004', 'Referral program design',                 'Incentive model and in-app referral flow.',    'Design',     '{EMP-007,EMP-009}', 'EMP-003', 'Medium',   'Backlog',     current_date + 5,  current_date + 25, null,              14, 'Low',    null),
('PRJ-004', 'Sales outreach email sequences',          '3 sequences x 5 emails for each persona.',     'Content',    '{EMP-010}',         'EMP-009', 'Medium',   'Assigned',    current_date,      current_date + 12, null,              10, 'Low',    null),
-- PRJ-005 Fundraising
('PRJ-005', 'Financial model & 3-year projections',    'Bottom-up revenue model, hiring plan, burn.',  'Management', '{EMP-014}',         'EMP-001', 'Critical', 'In Progress', current_date - 20, current_date + 7,  null,              30, 'High',   null),
('PRJ-005', 'Investor pitch deck v2',                  'Narrative, traction, market and ask.',         'Design',     '{EMP-001,EMP-007}', 'EMP-001', 'Critical', 'Review',      current_date - 15, current_date + 3,  null,              20, 'Medium', 'Feedback from advisor due Monday.'),
('PRJ-005', 'Data room preparation',                   'Legal, financial and product documents.',      'Management', '{EMP-014,EMP-013}', 'EMP-014', 'High',     'Assigned',    current_date - 5,  current_date + 20, null,              24, 'Low',    null),
('PRJ-005', 'Investor target list & CRM',              '80 seed investors segmented by thesis.',       'Research',   '{EMP-001}',         'EMP-001', 'High',     'Completed',   current_date - 20, current_date - 8,  current_date - 9,  8,  'Low',    null),
('PRJ-005', 'Legal due-diligence checklist',           'Cap table, IP assignment, contracts.',         'Management', '{EMP-013}',         'EMP-014', 'Medium',   'Backlog',     current_date + 7,  current_date + 30, null,              12, 'Medium', null),
-- PRJ-006 Hiring
('PRJ-006', 'Define org chart for next 12 months',     'Roles, levels and reporting lines.',           'Management', '{EMP-001,EMP-013}', 'EMP-013', 'High',     'Assigned',    current_date + 5,  current_date + 15, null,              8,  'Low',    null),
('PRJ-006', 'Job descriptions for 6 roles',            'JD, scorecards and interview loops.',          'Content',    '{EMP-013}',         'EMP-013', 'Medium',   'Backlog',     current_date + 7,  current_date + 20, null,              12, 'Low',    null),
('PRJ-006', 'Careers page refresh',                    'New careers page with open roles feed.',       'Development','{EMP-005}',         'EMP-013', 'Low',      'Backlog',     current_date + 10, current_date + 30, null,              10, 'Low',    null),
-- PRJ-007 Northwind (completed)
('PRJ-007', 'Storefront design',                       'Homepage, PLP, PDP and checkout designs.',     'Design',     '{EMP-007}',         'EMP-003', 'High',     'Completed',   current_date - 120, current_date - 100, current_date - 101, 40, 'Low', null),
('PRJ-007', 'Headless Shopify build',                  'Next.js storefront with Shopify Storefront API.', 'Development','{EMP-005,EMP-004}', 'EMP-002', 'High',  'Completed',   current_date - 100, current_date - 50,  current_date - 52,  120, 'Low', null),
('PRJ-007', 'Product data migration',                  '1,200 SKUs migrated with variants.',           'Development','{EMP-004}',         'EMP-002', 'Medium',   'Completed',   current_date - 60,  current_date - 45,  current_date - 46,  24, 'Low', null),
('PRJ-007', 'Performance & SEO audit',                 'Core Web Vitals and technical SEO.',           'QA',         '{EMP-008}',         'EMP-003', 'Medium',   'Completed',   current_date - 45,  current_date - 33,  current_date - 34,  16, 'Low', null),
-- PRJ-008 BlueOcean
('PRJ-008', 'Requirements workshop with client',       'Scope, user roles and integrations.',          'Management', '{EMP-003,EMP-002}', 'EMP-003', 'High',     'Completed',   current_date - 40, current_date - 35, current_date - 35, 12, 'Low',    null),
('PRJ-008', 'Live GPS tracking map',                   'Real-time vehicle positions on Mapbox.',       'Development','{EMP-004,EMP-005}', 'EMP-002', 'High',     'In Progress', current_date - 20, current_date + 14, null,              40, 'Medium', null),
('PRJ-008', 'Driver mobile check-in',                  'Check-in / check-out with photo proof.',       'Development','{EMP-006}',         'EMP-002', 'Medium',   'Assigned',    current_date - 3,  current_date + 25, null,              32, 'Low',    null),
('PRJ-008', 'Kubernetes deployment',                   'Production cluster in client AWS account.',    'DevOps',     '{EMP-015}',         'EMP-002', 'Medium',   'Backlog',     current_date + 10, current_date + 40, null,              20, 'Medium', null),
('PRJ-008', 'Security & penetration test',             'Third-party pentest and fixes.',               'QA',         '{EMP-008,EMP-015}', 'EMP-003', 'High',     'Backlog',     current_date + 30, current_date + 45, null,              16, 'High',   null),
-- PRJ-009 Helix
('PRJ-009', 'Script & storyboard for 6 episodes',      'Narrative arc, shot lists and storyboards.',   'Content',    '{EMP-010,EMP-012}', 'EMP-012', 'Medium',   'Completed',   current_date - 25, current_date - 15, current_date - 16, 20, 'Low',    null),
('PRJ-009', 'Studio shoot — episodes 1–3',             'Two-day shoot with talent.',                   'Content',    '{EMP-012}',         'EMP-012', 'High',     'Blocked',     current_date - 10, current_date + 1,  null,              30, 'High',   'Client paused until new gym location opens.');

-- ---------- Meetings & actions ----------
insert into public.meetings (meeting_date, meeting_type, participants, topic, decision, action_item, owner_id, deadline, status) values
(current_date - 14, 'Sprint Planning', '{EMP-002,EMP-003,EMP-004,EMP-005,EMP-007,EMP-008}', 'Sprint 7 planning — MVP',            'Payments moved into Sprint 7 scope.',          'Finalise Stripe account verification',         'EMP-002', current_date - 5,  'Completed'),
(current_date - 10, 'Investor Update', '{EMP-001,EMP-014}',                                 'Monthly investor update',            'Share updated traction metrics with angels.',  'Send October investor update email',          'EMP-001', current_date - 3,  'Completed'),
(current_date - 7,  'Client Meeting',  '{EMP-003,EMP-002}',                                 'BlueOcean milestone 1 review',       'Client approved milestone 1; invoice issued.', 'Share milestone 2 timeline with client',       'EMP-003', current_date + 2,  'In Progress'),
(current_date - 5,  'Management',      '{EMP-001,EMP-013,EMP-014}',                         'Hiring budget for Q4',               'Approve 3 hires now, 3 after seed close.',     'Publish first 3 job descriptions',             'EMP-013', current_date + 10, 'Open'),
(current_date - 3,  'Sprint Review',   '{EMP-003,EMP-004,EMP-005,EMP-006,EMP-007,EMP-008}', 'Mobile app beta review',             'Push notifications are launch-blocking.',      'Unblock FCM credentials with client admin',    'EMP-006', current_date + 1,  'Open'),
(current_date - 2,  'Client Meeting',  '{EMP-009,EMP-010}',                                 'GreenLeaf content calendar',         'Shift to 70% reels / 30% static.',             'Deliver revised November content calendar',    'EMP-010', current_date + 4,  'In Progress'),
(current_date - 1,  'All Hands',       '{EMP-001,EMP-002,EMP-003,EMP-009,EMP-013,EMP-014}', 'Company OKRs Q4',                    'Top OKR: 50 beta customers by quarter end.',   'Cascade OKRs to team leads',                   'EMP-003', current_date + 7,  'Open'),
(current_date - 20, 'Management',      '{EMP-001,EMP-009}',                                 'Influencer budget',                  'Budget deferred pending campaign results.',    'Prepare ROI case for influencer budget',       'EMP-009', current_date - 6,  'Open');

-- ---------- Invoices (income) ----------
insert into public.invoices (client_id, project_id, issue_date, due_date, amount, paid, status, notes) values
('CLI-001', 'PRJ-007', current_date - 110, current_date - 80, 11400, 11400, 'Sent',  'Deposit 30%'),
('CLI-001', 'PRJ-007', current_date - 70,  current_date - 40, 15200, 15200, 'Sent',  'Milestone 2 — 40%'),
('CLI-001', 'PRJ-007', current_date - 30,  current_date - 0,  11400, 5000,  'Sent',  'Final 30% — part paid'),
('CLI-002', null,      current_date - 35,  current_date - 5,  1200,  1200,  'Sent',  'Retainer — last month'),
('CLI-002', null,      current_date - 5,   current_date + 25, 1200,  0,     'Sent',  'Retainer — this month'),
('CLI-003', 'PRJ-008', current_date - 38,  current_date - 8,  21600, 21600, 'Sent',  'Deposit 30%'),
('CLI-003', 'PRJ-008', current_date - 6,   current_date + 24, 28800, 0,     'Sent',  'Milestone 1 — 40%'),
('CLI-004', 'PRJ-009', current_date - 25,  current_date - 10, 9250,  4000,  'Sent',  '50% upfront — partially paid'),
('CLI-005', null,      current_date - 32,  current_date - 2,  800,   0,     'Sent',  'Retainer — last month (chasing)'),
('CLI-006', null,      current_date,       current_date + 30, 7500,  0,     'Draft', 'Discovery phase — pending signature');

-- ---------- Expenses ----------
insert into public.expenses (expense_date, category, description, vendor, project_id, amount, payment_method, status, notes) values
(current_date - 60, 'Salaries',                 'Payroll — two months ago',             'Payroll',           null,      42000, 'Bank Transfer', 'Paid',    null),
(current_date - 30, 'Salaries',                 'Payroll — last month',                 'Payroll',           null,      43500, 'Bank Transfer', 'Paid',    null),
(current_date - 28, 'Office & Rent',            'Co-working office rent',               'WorkHub Colombo',   null,      2400,  'Bank Transfer', 'Paid',    null),
(current_date - 25, 'Hosting & Infrastructure', 'AWS — production & staging',           'Amazon Web Services','PRJ-001', 1850,  'Card',          'Paid',    null),
(current_date - 24, 'Software & Tools',         'Figma, Jira, Slack, GitHub seats',     'Various SaaS',      null,      980,   'Card',          'Paid',    null),
(current_date - 20, 'Marketing',                'Meta ads — launch campaign',           'Meta',              'PRJ-003', 3200,  'Card',          'Paid',    null),
(current_date - 18, 'Equipment',                'MacBook Pro for new developer',        'iStore',            null,      2600,  'Card',          'Paid',    null),
(current_date - 15, 'Professional Services',    'Legal — SAFE note templates',          'Lex Partners',      'PRJ-005', 1500,  'Bank Transfer', 'Paid',    null),
(current_date - 12, 'Travel',                   'Client visit — Singapore',             'SriLankan Airlines','PRJ-008', 1100,  'Card',          'Paid',    null),
(current_date - 10, 'Marketing',                'Google Ads — search campaign',         'Google',            'PRJ-003', 1800,  'Card',          'Paid',    null),
(current_date - 8,  'Hosting & Infrastructure', 'Mapbox API usage',                     'Mapbox',            'PRJ-008', 420,   'Card',          'Paid',    null),
(current_date - 5,  'Utilities',                'Internet & electricity',               'Dialog / CEB',      null,      310,   'Bank Transfer', 'Paid',    null),
(current_date - 2,  'Office & Rent',            'Co-working office rent',               'WorkHub Colombo',   null,      2400,  'Bank Transfer', 'Pending', 'Due on the 5th'),
(current_date - 1,  'Salaries',                 'Payroll — this month',                 'Payroll',           null,      44200, 'Bank Transfer', 'Pending', null);

-- ---------- Risks ----------
insert into public.risks (project_id, description, category, probability, impact, owner_id, mitigation, status, target_date) values
('PRJ-001', 'Stripe merchant verification delays payment launch',           'Financial',   4, 4, 'EMP-002', 'Parallel-track PayHere as fallback gateway.',            'Open',       current_date + 5),
('PRJ-001', 'Scope creep from beta customer feature requests',              'Operational', 4, 3, 'EMP-003', 'Strict change-request process; park ideas in v1.1.',    'Monitoring', current_date + 20),
('PRJ-002', 'App store rejection delays mobile launch',                     'Technical',   3, 4, 'EMP-006', 'Pre-review against guidelines; TestFlight external beta.', 'Open',     current_date + 6),
('PRJ-002', 'Single mobile developer — key-person dependency',              'Team',        3, 5, 'EMP-002', 'Cross-train Kavindu; hire 2nd mobile dev in Q4.',        'Escalated',  current_date + 30),
('PRJ-003', 'Launch video delay reduces campaign effectiveness',            'Market',      5, 3, 'EMP-009', 'Run static creatives first; video in week 2.',           'Open',       current_date + 3),
('PRJ-003', 'Paid CAC higher than forecast',                                'Financial',   3, 3, 'EMP-009', 'Weekly budget re-allocation to best channels.',          'Monitoring', current_date + 14),
('PRJ-004', 'Low response rate on outbound emails',                         'Customer',    3, 2, 'EMP-010', 'A/B test subject lines; warm intros via investors.',     'Open',       current_date + 21),
('PRJ-005', 'Seed round takes longer than runway allows',                   'Financial',   3, 5, 'EMP-001', 'Bridge from angels; cut non-essential spend by 15%.',    'Open',       current_date + 40),
('PRJ-005', 'Missing IP assignment agreements from early contractors',      'Legal',       2, 4, 'EMP-013', 'Collect signed IP agreements before data room opens.',   'Open',       current_date + 14),
('PRJ-006', 'Competitive hiring market for senior engineers',               'Team',        4, 3, 'EMP-013', 'ESOP pool; referral bonus; remote-friendly roles.',      'Monitoring', current_date + 60),
('PRJ-008', 'Client data-integration API not ready',                        'Technical',   2, 3, 'EMP-002', 'Build against mocked API contract.',                     'Mitigated',  current_date - 2),
('PRJ-009', 'Client project pause impacts revenue forecast',                'Customer',    4, 2, 'EMP-001', 'Re-allocate video team to Marketing Growth Campaign.',   'Open',       current_date + 15);

-- ---------- Assets ----------
insert into public.assets (id, name, category, serial_number, assigned_to, purchase_date, purchase_cost, warranty_until, condition, status, notes) values
('AST-001', 'MacBook Pro 14" M3',         'Laptop',          'C02FX1Y2MD6T', 'EMP-004', current_date - 400, 2400, current_date + 330, 'Good',      'Assigned',     null),
('AST-002', 'MacBook Pro 14" M3',         'Laptop',          'C02FX1Y2MD7K', 'EMP-002', current_date - 400, 2400, current_date + 330, 'Excellent', 'Assigned',     null),
('AST-003', 'MacBook Air 13" M2',         'Laptop',          'C02GH3K4Q6LR', 'EMP-005', current_date - 380, 1300, current_date + 20,  'Good',      'Assigned',     'Warranty expiring soon.'),
('AST-004', 'MacBook Pro 16" M3 Pro',     'Laptop',          'C02JK5L6P8NV', 'EMP-007', current_date - 300, 3200, current_date + 430, 'Excellent', 'Assigned',     'Design workstation'),
('AST-005', 'Dell XPS 15',                'Laptop',          'DXPS15-88213', 'EMP-008', current_date - 500, 1800, current_date - 130, 'Fair',      'Assigned',     null),
('AST-006', 'Dell UltraSharp 27" 4K',     'Monitor',         'DU27-551029',  'EMP-004', current_date - 400, 620,  current_date + 700, 'Excellent', 'Assigned',     null),
('AST-007', 'iPhone 15 (test device)',    'Mobile Device',   'F2LXK9P1Q3',   'EMP-006', current_date - 250, 900,  current_date + 115, 'Good',      'Assigned',     'QA device pool'),
('AST-008', 'Samsung Galaxy S24 (test)',  'Mobile Device',   'R58T30ABCD',   null,      current_date - 240, 850,  current_date + 125, 'Good',      'Available',    'QA device pool'),
('AST-009', 'Sony A7 IV Camera Kit',      'Camera',          'SNY-A7IV-0091',  'EMP-012', current_date - 330, 2900, current_date + 35, 'Good',      'Assigned',     'Includes 24-70mm lens'),
('AST-010', 'Rode Wireless GO II',        'Audio',           'RWG2-77120',   null,      current_date - 330, 300,  current_date + 35,  'Fair',      'Under Repair', 'Receiver not charging.'),
('AST-011', 'MacBook Air 13" M1',         'Laptop',          'C02DL1M2Q05N', null,      current_date - 900, 1100, current_date - 535, 'Poor',      'Retired',      'Battery health 71%.'),
('AST-012', 'Adobe Creative Cloud (team)', 'Software License', 'ACC-TEAM-2026', 'EMP-012', current_date - 60, 1080, current_date + 305, 'New',       'Assigned',     'Annual licence');

-- Back-date the auto-created "currently assigned" log rows and add handover history.
update public.asset_assignments l
   set assigned_at = (a.purchase_date + 3)::timestamptz
  from public.assets a
 where a.id = l.asset_id and l.returned_at is null;

update public.asset_assignments set assigned_at = now() - interval '120 days' where asset_id = 'AST-001' and returned_at is null;
update public.asset_assignments set assigned_at = now() - interval '200 days' where asset_id = 'AST-003' and returned_at is null;

insert into public.asset_assignments (asset_id, employee_id, assigned_at, returned_at, condition_assigned, condition_returned, notes) values
('AST-001', 'EMP-005', now() - interval '397 days', now() - interval '200 days', 'New',       'Excellent', 'Swapped to MacBook Air during desk move'),
('AST-001', 'EMP-015', now() - interval '200 days', now() - interval '120 days', 'Excellent', 'Good',      'Handed over to Kavindu'),
('AST-003', 'EMP-010', now() - interval '377 days', now() - interval '200 days', 'New',       'Good',      'Content team upgraded'),
('AST-008', 'EMP-008', now() - interval '237 days', now() - interval '15 days',  'New',       'Good',      'Returned to QA device pool'),
('AST-010', 'EMP-012', now() - interval '327 days', now() - interval '6 days',   'New',       'Fair',      'Returned for repair'),
('AST-011', 'EMP-003', now() - interval '897 days', now() - interval '90 days',  'New',       'Poor',      'Retired — replaced'),
('AST-011', 'EMP-013', now() - interval '90 days',  now() - interval '30 days',  'Poor',      'Poor',      'Temporary loan, then retired');

-- ---------- Keep ID sequences ahead of the seeded IDs ----------
select setval('public.emp_seq', 15);
select setval('public.cli_seq', 6);
select setval('public.prj_seq', 9);
select setval('public.dm_seq', 5);
select setval('public.ast_seq', 12);
