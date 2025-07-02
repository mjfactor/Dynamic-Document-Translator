import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Response type definitions
interface DocumentParserResponse {
    success: boolean;
    data?: {
        extractedText: string;
        metadata: {
            filename: string;
            fileSize: number;
            extractedAt: string;
            pageCount?: number;
        };
    };
    error?: string;
}

interface DocumentParserError {
    success: false;
    error: string;
}

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf'];
const SUPPORTED_FILE_EXTENSIONS = ['.pdf'];

// Validation schema
const fileValidationSchema = z.object({
    name: z.string().min(1, 'Filename is required'),
    size: z.number().max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`),
    type: z.string().refine(
        (type) => ALLOWED_MIME_TYPES.includes(type),
        'Only PDF files are supported'
    ),
});

// Helper functions
const validateFile = (file: File): { isValid: boolean; error?: string } => {
    try {
        fileValidationSchema.parse({
            name: file.name,
            size: file.size,
            type: file.type,
        });

        // Additional extension check
        const hasValidExtension = SUPPORTED_FILE_EXTENSIONS.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (!hasValidExtension) {
            return {
                isValid: false,
                error: 'File must have a .pdf extension',
            };
        }

        return { isValid: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                isValid: false,
                error: error.errors[0]?.message || 'File validation failed',
            };
        }
        return {
            isValid: false,
            error: 'Unknown validation error',
        };
    }
};

const createErrorResponse = (message: string, status = 400): NextResponse<DocumentParserError> => {
    return NextResponse.json(
        { success: false, error: message },
        { status }
    );
};

const createSuccessResponse = (data: DocumentParserResponse['data']): NextResponse<DocumentParserResponse> => {
    return NextResponse.json(
        { success: true, data },
        { status: 200 }
    );
};

// Main POST handler
export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        // Check if API key is configured
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return createErrorResponse('Google Generative AI API key not configured', 500);
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('pdf') as File;

        // Validate file presence
        if (!file) {
            return createErrorResponse('No PDF file provided. Please upload a PDF file.');
        }

        // Validate file
        const validation = validateFile(file);
        if (!validation.isValid) {
            return createErrorResponse(validation.error!);
        }

        // Convert file to ArrayBuffer
        const fileBuffer = await file.arrayBuffer();

        // Extract text using Google Gemini
        const result = await generateText({
            model: google('gemini-2.5-flash'),
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Please extract all text content from this PDF document. 
                     Preserve the structure and formatting as much as possible. 
                     Return the complete text content in a clean, readable format. 
                     If the document has multiple pages, include all content sequentially.`,
                        },
                        {
                            type: 'file',
                            data: fileBuffer,
                            mimeType: 'application/pdf',
                            filename: file.name,
                        },
                    ],
                },
            ],
            maxTokens: 4000, // Generous token limit for large documents
            temperature: 0, // Deterministic for text extraction
        });

        // Prepare response data
        const responseData = {
            extractedText: result.text.trim(),
            metadata: {
                filename: file.name,
                fileSize: file.size,
                extractedAt: new Date().toISOString(),
                // Note: Page count detection would require additional processing
                // Can be added later if needed
            },
        };

        // Validate that we got meaningful text
        if (!responseData.extractedText || responseData.extractedText.length < 10) {
            return createErrorResponse(
                'Could not extract meaningful text from the PDF. The document may be empty, corrupted, or contain only images.',
                422
            );
        }

        return createSuccessResponse(responseData);

    } catch (error) {
        console.error('Document parser error:', error);

        // Handle specific error types
        if (error instanceof Error) {
            // Check for common API errors
            if (error.message.includes('API key')) {
                return createErrorResponse('API authentication failed', 401);
            }

            if (error.message.includes('quota') || error.message.includes('rate limit')) {
                return createErrorResponse('Service temporarily unavailable. Please try again later.', 503);
            }

            if (error.message.includes('timeout')) {
                return createErrorResponse('Document processing timed out. Please try with a smaller file.', 408);
            }

            // Generic error with message
            return createErrorResponse(`Processing failed: ${error.message}`, 500);
        }

        // Fallback error
        return createErrorResponse('An unexpected error occurred while processing the document', 500);
    }
};

// Handle unsupported methods
export const GET = async (): Promise<NextResponse> => {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to upload a PDF file.' },
        { status: 405 }
    );
};

export const PUT = async (): Promise<NextResponse> => {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to upload a PDF file.' },
        { status: 405 }
    );
};

export const DELETE = async (): Promise<NextResponse> => {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to upload a PDF file.' },
        { status: 405 }
    );
};