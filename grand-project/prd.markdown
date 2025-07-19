# Recipe Generator PRD

## 1. Overview
Recipe Generator is an AI-powered web app that creates personalized recipes based on user inputs (ingredients, cuisine, dietary restrictions). It features secure authentication, a responsive UI, and AI-driven recipe generation powered by n8n workflows.

## 2. Objectives
- Allow users to log in via magic link (email).
- Enable users to input ingredients/preferences and receive AI-generated recipes.
- Store user data in Supabase and recipes in MongoDB.
- Deploy seamlessly with CI/CD on Vercel.

## 3. Features
### Authentication
- Magic link login via Supabase Auth.
- Users receive an email with a login link; no password required.
- Session management with JWT tokens.

### Recipe Generation
- Input form for ingredients, cuisine type (e.g., Italian, Vegan), and dietary restrictions.
- AI logic via n8n workflow calling an external AI API (e.g., Grok 3 API).
- Generated recipes include title, ingredients, instructions, and estimated prep time.

### Database
- **Supabase**: Stores user profiles (email, preferences).
- **MongoDB**: Stores generated recipes with fields for title, ingredients, instructions, and metadata.

### UI
- React-based frontend with Tailwind CSS.
- Pages: Login, Home (input form), Recipe Display, User Profile.
- Responsive design for mobile and desktop.

### Deployment
- Hosted on Vercel with CI/CD pipeline.
- Automatic builds on push to `main` branch.

## 4. User Flow
1. User visits app and clicks "Login with Email."
2. Enters email, receives magic link, and logs in.
3. Inputs ingredients/preferences in a form.
4. AI generates recipe; result displayed with save option.
5. User can view saved recipes in profile.

## 5. Wireframes
### Login Page
- Email input field + "Send Magic Link" button.
- Simple, centered layout with app logo.

### Home Page
- Form: Text input for ingredients, dropdown for cuisine, checkboxes for dietary restrictions.
- "Generate Recipe" button.

### Recipe Display
- Recipe card with title, ingredients list, instructions, and prep time.
- "Save Recipe" button.

### Profile Page
- List of saved recipes.
- Option to update preferences.

## 6. Technical Requirements
- **Frontend**: React, Tailwind CSS, Vite.
- **Backend**: Node.js, Express, Supabase SDK, MongoDB driver.
- **AI**: n8n workflow integrating Grok 3 API.
- **Deployment**: Vercel with GitHub integration.
- **Environment**: `.env` for API keys, database URLs.

## 7. Milestones
1. **Setup**: Initialize repo, Supabase, MongoDB, Vercel.
2. **Backend**: Build API routes, auth, and database schemas.
3. **AI Logic**: Configure n8n workflow for recipe generation.
4. **Frontend**: Develop UI components and integrate with backend.
5. **Testing**: Unit tests for backend, integration tests for AI.
6. **Deployment**: Configure CI/CD pipeline.

## 8. Success Metrics
- 95%+ successful magic link logins.
- <5s recipe generation time.
- 100% uptime on Vercel.
- User satisfaction score >4/5 (via feedback form).