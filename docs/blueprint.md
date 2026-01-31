# **App Name**: QuickPaste

## Core Features:

- Text Input: Large textarea for pasting or typing text to be transferred.
- Code Generation: Generate a unique 4-6 character uppercase code after the user clicks 'Generate Code'.
- Text Retrieval: Allow users to enter a code and instantly display the associated text for copying.
- Temporary Storage: Use Redis (or an in-memory Map) for temporary storage of text, with a TTL of 5 minutes. Automatically clean expired entries.
- Data Validation: Validate the input text length to ensure it is within the 10,000-character limit.
- Text Deletion: Delete the text from the database immediately after it has been successfully retrieved once.
- Copy to Clipboard: Prominent 'Copy' button on the receiving end to copy the text to clipboard.

## Style Guidelines:

- Primary color: Dark blue (#243c5a) for a professional and reliable feel.
- Background color: Very dark blue (#0c1929) to reduce eye strain and improve focus on content.
- Accent color: Light blue (#5798c9) for interactive elements to draw attention without being overwhelming.
- Body and headline font: 'Inter', a sans-serif font, to offer a modern and machined aesthetic. Code font: 'Source Code Pro' for displaying the code.
- Simple, minimalist icons for actions like 'copy', 'send', and 'receive'.
- Single-page layout with a clear division between the 'Send' and 'Receive' sections.
- Subtle loading animations and transitions to indicate activity and provide feedback to the user.