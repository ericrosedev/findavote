# FindaVote Application

## Overview
FindaVote is a platform where users can create and browse posts about ICP SNS DAO participation, detailing voting values and methodologies, and share neuron addresses for following. The application includes admin management features for content moderation.

## Authentication & User Management
- Users authenticate using Internet Identity
- The first user to log in automatically becomes a super admin
- Subsequent users are standard users by default
- Super admins can promote users to standard admin or super admin roles
- Super admins can remove admin privileges from other users

## User Roles & Permissions
- **Super Admin**: Can manage all admins, remove posts
- **Standard Admin**: Can remove posts only
- **Standard User**: Can create and view posts
- **Anonymous User**: Can view posts only (cannot create, edit, or delete posts)

## Post Management
- Posts contain:
  - Image upload (maximum 120x120 pixels, 200kb file size)
  - Title (maximum 100 characters)
  - Description (maximum 1000 characters)
  - DAO information and addresses
  - Social media links (with reasonable character limits)
- All posts are stored on the backend
- Admins can remove posts from the system
- Each user can only have one active post at a time (based on their principal)
- Users cannot create a new post if they already have an existing post
- Users can edit or delete their existing post
- Users can only create a new post after deleting their current post
- Authentication is required for all post creation, editing, and deletion operations

## Pages & Navigation
- **Header**: Persistent navigation with logo, page links (excluding admin page), and login status
- **Footer**: Persistent footer showing copyright and current year
- **Home (/)**: Landing page featuring content about user posts on voting approaches, with the message "Follow like-minded voters and never miss important voting decisions in the ICP SNS DAO ecosystem."
- **Find (/find)**: Browse all posts with toggleable list/grid view and modal details, with the heading "Find Voters to Follow"
- **Post (/post)**: Create new posts or edit existing post if user already has one (requires authentication)
- **Admin (/admin)**: Admin-only page for user management and post moderation
- **About**: Information about the application, including the message "This application was created during the Caffeine.ai launch event hackathon in San Francisco on July 15th 2025, and worked on by a team of non-developers for the World Computer Hacker League 2025 hackathon. Caffeine is an AI-powered development platform that enables rapid creation of decentralized applications on the Internet Computer." The "How It Works" section h4 elements should have no top margin or padding for proper alignment with content below.

## Backend Data Storage
- User profiles with roles and permissions
- Post data including all submitted information with user principal tracking
- Admin management records

## Backend Operations
- User authentication and role management
- Post creation and storage with one-post-per-user enforcement (authenticated users only)
- Post editing and deletion by post owners (authenticated users only)
- Post removal by admins
- Checking if user already has an existing post before allowing new post creation
- Authentication verification for all post management operations