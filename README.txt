YOUTHTECH CONNECT UGANDA — SUPABASE CONNECTED STARTER

Files:
- index.html: website structure
- style.css: responsive styling
- app.js: Supabase signup/login, jobs, applications, business submissions
- supabase_setup.sql: tables, signup profile trigger, Row Level Security policies

SETUP (required before real use)
1. Open Supabase dashboard for project: https://hdxhymgktqzehfrrfjeb.supabase.co
2. Go to SQL Editor > New query.
3. Open supabase_setup.sql, copy all SQL and run it.
4. Check Authentication > Providers > Email. Enable Email provider.
5. For testing, optionally turn off email confirmation in Authentication settings. For public launch, keep email confirmation enabled and configure SMTP/custom email delivery.
6. In Authentication > URL Configuration, add your website URL and local testing URL (e.g. http://localhost:5500).
7. Open this folder in VS Code. Install Live Server extension and right-click index.html > Open with Live Server.
8. Test signup using an email you control. If confirmation is enabled, click the email confirmation link, then log in.
9. Create a user account. In Supabase > Authentication > Users, copy your user UUID.
10. In SQL Editor, make your own account admin:
   UPDATE public.profiles SET role='admin' WHERE id='YOUR_AUTH_USER_UUID';
   This does not yet provide an admin UI. Use Supabase dashboard to add jobs and approve businesses.
11. Add job rows using Table Editor > jobs. Use is_active=true for published roles.
12. Approve submitted businesses in Table Editor > businesses by setting is_approved=true.

IMPORTANT
- Supabase URL and publishable key are embedded in app.js. Publishable keys are designed for browser apps.
- Never add Supabase secret/service-role keys or database passwords to HTML/JS.
- RLS policies are essential. Run the provided SQL before testing.
- This starter supports real Supabase auth, profiles, job listing reads, user applications, and business submissions.
- It is not a fully audited production platform. Before public launch, review data privacy, terms, abuse reports, SMTP/email deliverability, backups, moderation, and Uganda data protection compliance.
- Job applications are stored in the database. The site currently does not send CVs or employer emails.
- Admin moderation is performed through Supabase Table Editor; a dedicated admin dashboard is a future feature.
- No real listings are included. Add and verify opportunities before publishing them.
