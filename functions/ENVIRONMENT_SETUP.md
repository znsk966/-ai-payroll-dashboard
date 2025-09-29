# Firebase Functions Environment Setup

## Environment Variables

This project uses environment variables for sensitive configuration. Since deployment is through GitHub Actions, environment variables are managed through GitHub Secrets.

### Local Development Setup

1. Create a `.env` file in the `functions` directory:
   ```bash
   touch functions/.env
   ```

2. Add your environment variables to the `.env` file:
   ```env
   # Google AI API Key
   GEMINI_KEY=your_actual_api_key_here
   ```

3. Replace `your_actual_api_key_here` with your actual Google AI API key.

### GitHub Deployment Setup

For GitHub Actions deployment, you need to set up GitHub Secrets:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:
   - **Name**: `GEMINI_KEY`
   - **Value**: Your actual Google AI API key

### Security Notes

- The `.env` file is already added to `.gitignore` and will not be committed to version control
- Never commit API keys or sensitive information to the repository
- GitHub Secrets are encrypted and only accessible during deployment
- Environment variables are automatically passed to Firebase Functions during deployment

### How It Works

- **Local development**: Uses `.env` file with `dotenv` package
- **GitHub deployment**: Uses GitHub Secrets passed as environment variables
- **Firebase Functions**: Automatically receives environment variables during deployment

The code uses `process.env.GEMINI_KEY` which works seamlessly in both environments.
