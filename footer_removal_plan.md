# Footer Removal Plan

## Problem

Multiple pages are importing and rendering their own Footer components even though they're already wrapped in layouts that automatically include Footer.

## Layout Structure

1. **AppLayout** - Automatically renders Footer for public pages
2. **MainLayout** - Automatically renders Footer for authenticated pages

## Files to Edit

### Pages under AppLayout (Public Pages)

These pages should NOT render their own Footer:

- Features.jsx - Remove Footer import and <Footer /> rendering
- Terms.jsx - Remove Footer import and <Footer /> rendering
- Contacts.jsx - Remove Footer import and <Footer /> rendering
- HomePage.jsx - Remove Footer import and <Footer /> rendering
- FindTherapist.jsx - Remove Footer import and <Footer /> rendering

### Pages under MainLayout (/easebrain routes)

These pages should NOT render their own Footer:

- Messages.jsx - Remove Footer import and <Footer /> rendering
- Dashboard.jsx - Remove Footer import and <Footer /> rendering
- Settings.jsx - Remove Footer import and <Footer /> rendering
- Reminders.jsx - Remove Footer import and <Footer /> rendering
- AiSupport.jsx - Remove Footer import and <Footer /> rendering
- Community.jsx - Remove Footer import and <Footer /> rendering
- Emergency.jsx - Remove Footer import and <Footer /> rendering
- Privacy.jsx - Remove Footer import and <Footer /> rendering
- Notes.jsx - Remove Footer import and <Footer /> rendering
- ForumHome.jsx - Remove Footer import and <Footer /> rendering

### App.jsx

- Remove Footer import and <Footer /> rendering (already handled by layout)

## Changes Required

For each file:

1. Remove the Footer import line
2. Remove the Footer component rendering

## Expected Result

- Footer will only render once per page through the layout system
- No duplicate footers
- Consistent footer placement across the application
