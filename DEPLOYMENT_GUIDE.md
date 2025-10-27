# Deployment Guide

This guide provides instructions on how to deploy the new Cortex documentation website.

## Deploying to Netlify

Netlify is a popular platform for deploying static websites. Here is how you can deploy the new Cortex website to Netlify:

1.  **Sign up for a Netlify account:** If you don't already have one, sign up for a free Netlify account.
2.  **Create a new site from Git:** In the Netlify dashboard, click the "New site from Git" button.
3.  **Connect to your Git provider:** Connect to your Git provider (e.g., GitHub, GitLab, Bitbucket) and choose the repository for the Cortex project.
4.  **Configure your build settings:**
    *   **Build command:** `npm run build` (or the appropriate build command for your project)
    *   **Publish directory:** `new-website`
5.  **Deploy your site:** Click the "Deploy site" button.

Netlify will now build and deploy your website. You will be given a unique URL for your new website.

## Deploying to Vercel

Vercel is another popular platform for deploying static websites. Here is how you can deploy the new Cortex website to Vercel:

1.  **Sign up for a Vercel account:** If you don't already have one, sign up for a free Vercel account.
2.  **Import your project:** In the Vercel dashboard, click the "Import Project" button.
3.  **Connect to your Git provider:** Connect to your Git provider and choose the repository for the Cortex project.
4.  **Configure your project:** Vercel will automatically detect that you are deploying a static website and configure the build settings for you. You may need to change the "Output Directory" to `new-website`.
5.  **Deploy your site:** Click the "Deploy" button.

Vercel will now build and deploy your website. You will be given a unique URL for your new website.
