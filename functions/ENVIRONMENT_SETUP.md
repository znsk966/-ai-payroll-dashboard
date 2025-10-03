# Firebase Functions Environment Setup

## Environment Variables

This project uses environment variables for sensitive configuration. Environment variables are managed through Firebase Functions configuration.

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

### Firebase Deployment Setup

For Firebase deployment, you need to set up environment variables:

1. Use Firebase CLI to set environment variables:
   ```bash
   firebase functions:config:set gemini.key="your_actual_api_key_here"
   ```

2. Or use Firebase Console:
   - Go to Firebase Console → Functions → Configuration
   - Add environment variable `GEMINI_KEY` with your actual Google AI API key

### Security Notes

- The `.env` file is already added to `.gitignore` and will not be committed to version control
- Never commit API keys or sensitive information to the repository
- Firebase Functions configuration is encrypted and secure
- Environment variables are automatically passed to Firebase Functions during deployment

### How It Works

- **Local development**: Uses `.env` file with `dotenv` package
- **Firebase deployment**: Uses Firebase Functions configuration
- **Firebase Functions**: Automatically receives environment variables during deployment

The code uses `process.env.GEMINI_KEY` which works seamlessly in both environments.
