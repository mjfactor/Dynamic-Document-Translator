import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { documentParserSchema } from '@/lib/schema/document-parser';
import { DocumentParserResult, DocumentParserResponse } from '@/lib/types';

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

const createErrorResponse = (message: string, status = 400): NextResponse => {
    return NextResponse.json(
        { success: false, error: message },
        { status }
    );
};

const createSuccessResponse = (data: DocumentParserResult): NextResponse<DocumentParserResponse> => {
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

        // Extract comprehensive document data using Google Gemini
        const result = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: documentParserSchema,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Please analyze this PDF document comprehensively and extract:

1. **Text Content**: Complete text extraction preserving structure
2. **Document Structure**: Identify headings, paragraphs, lists, tables, images, headers, footers
3. **Formatting Information**: Fonts, text styles (bold, italic, etc.), layout details
4. **Metadata**: Language detection, title, author, page count, creation date, quality assessment

Extract all content while preserving:
- Hierarchical structure (headings levels, section organization)
- Page layout information (columns, margins, orientation)
- Text formatting (fonts, styles, emphasis)
- Document properties and metadata

For each section, identify its type, content, and position within the document. Analyze the document quality and provide confidence scores for the extraction.

Filename: ${file.name}
File size: ${file.size} bytes`,
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
            temperature: 0, // Deterministic for document parsing
        });

        // Enhance the result with additional metadata
        const enhancedResult: DocumentParserResult = {
            ...result.object,
            metadata: {
                ...result.object.metadata,
                filename: file.name,
                fileSize: file.size,
                extractedAt: new Date().toISOString(),
            }
        };

        // Validate that we got meaningful text
        if (!enhancedResult.extractedText || enhancedResult.extractedText.length < 10) {
            return createErrorResponse(
                'Could not extract meaningful text from the PDF. The document may be empty, corrupted, or contain only images.',
                422
            );
        }

        return createSuccessResponse(enhancedResult);

    } catch (error) {
        console.error('Document parser error:', error);

        // Handle specific error types
        if (error instanceof Error) {
            // Check for generateObject specific errors
            if (error.name === 'AI_NoObjectGeneratedError') {
                return createErrorResponse(
                    'Failed to parse document structure. The document may be too complex or corrupted.',
                    422
                );
            }

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

            if (error.message.includes('token')) {
                return createErrorResponse('Document is too large to process. Please try with a smaller file.', 413);
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