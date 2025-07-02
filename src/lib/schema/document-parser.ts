import { z } from 'zod';

/**
 * Comprehensive schema for the Document Parser Agent
 * Captures text extraction, format detection, structure preservation, and metadata
 * Based on the multi-agent architecture requirements from README.md
 */
export const documentParserSchema = z.object({
  extractedText: z.string().describe('Complete text content extracted from the document'),
  
  structure: z.object({
    sections: z.array(z.object({
      type: z.enum(['heading', 'paragraph', 'list', 'table', 'image', 'footer', 'header', 'caption']),
      level: z.number().optional().describe('Heading level for headings (1-6)'),
      content: z.string().describe('Text content of this section'),
      position: z.object({
        page: z.number().describe('Page number where this section appears'),
        order: z.number().describe('Order within the page')
      })
    })).describe('Structured sections of the document with hierarchical information'),
    
    pageBreaks: z.array(z.number()).describe('Page numbers where page breaks occur'),
    totalPages: z.number().describe('Total number of pages in the document'),
    
    tableOfContents: z.array(z.object({
      title: z.string(),
      level: z.number(),
      page: z.number().optional()
    })).optional().describe('Table of contents if detected'),
    
    footnotes: z.array(z.object({
      number: z.number(),
      content: z.string(),
      page: z.number()
    })).optional().describe('Footnotes detected in the document')
  }).describe('Document structure and layout information for translation preservation'),

  formatting: z.object({
    fonts: z.array(z.object({
      name: z.string().describe('Font family name'),
      size: z.number().describe('Font size in points'),
      isUsedForHeadings: z.boolean().describe('Whether this font is used for headings'),
      isUsedForBody: z.boolean().describe('Whether this font is used for body text'),
      weight: z.enum(['normal', 'bold', 'light']).optional(),
      style: z.enum(['normal', 'italic', 'oblique']).optional()
    })).describe('Fonts detected in the document for format preservation'),
    
    styles: z.object({
      hasBold: z.boolean().describe('Document contains bold text'),
      hasItalic: z.boolean().describe('Document contains italic text'),
      hasUnderline: z.boolean().describe('Document contains underlined text'),
      hasStrikethrough: z.boolean().describe('Document contains strikethrough text'),
      hasHighlight: z.boolean().describe('Document contains highlighted text'),
      hasSuperscript: z.boolean().describe('Document contains superscript text'),
      hasSubscript: z.boolean().describe('Document contains subscript text')
    }).describe('Text styling information for format preservation'),
    
    layout: z.object({
      columns: z.number().describe('Number of columns detected'),
      hasHeaders: z.boolean().describe('Document has header sections'),
      hasFooters: z.boolean().describe('Document has footer sections'),
      hasWatermarks: z.boolean().describe('Document contains watermarks'),
      orientation: z.enum(['portrait', 'landscape']).describe('Page orientation'),
      margins: z.object({
        top: z.number().optional().describe('Top margin in points'),
        bottom: z.number().optional().describe('Bottom margin in points'),
        left: z.number().optional().describe('Left margin in points'),
        right: z.number().optional().describe('Right margin in points')
      }).optional().describe('Page margin information')
    }).describe('Page layout information for structural preservation')
  }).describe('Document formatting and style information essential for translation output'),

  metadata: z.object({
    filename: z.string().describe('Original filename'),
    fileSize: z.number().describe('File size in bytes'),
    extractedAt: z.string().describe('ISO timestamp when extraction was performed'),
    pageCount: z.number().describe('Total number of pages'),
    
    // Document properties
    language: z.string().optional().describe('Detected primary language of the document (ISO 639-1 code)'),
    title: z.string().optional().describe('Document title if detected from metadata or content'),
    author: z.string().optional().describe('Document author if detected'),
    subject: z.string().optional().describe('Document subject/topic if available'),
    keywords: z.array(z.string()).optional().describe('Document keywords if available'),
    
    // Technical metadata
    creationDate: z.string().optional().describe('Document creation date (ISO format) if available'),
    lastModified: z.string().optional().describe('Last modification date (ISO format) if available'),
    pdfVersion: z.string().optional().describe('PDF version if detectable'),
    producer: z.string().optional().describe('PDF producer application if available'),
    
    // Content analysis
    wordCount: z.number().optional().describe('Approximate word count'),
    characterCount: z.number().optional().describe('Total character count'),
    hasImages: z.boolean().describe('Document contains images'),
    hasCharts: z.boolean().describe('Document contains charts or graphs'),
    hasTables: z.boolean().describe('Document contains tables'),
    hasFormFields: z.boolean().describe('Document contains form fields'),
    
    // Quality indicators
    isScanned: z.boolean().describe('Whether document appears to be scanned (OCR needed)'),
    textQuality: z.enum(['excellent', 'good', 'fair', 'poor']).describe('Quality of extracted text'),
    extractionConfidence: z.number().min(0).max(1).describe('Confidence score for text extraction (0-1)')
  }).describe('Comprehensive document metadata for translation workflow')
});



/**
 * Response schema that wraps the document parser result
 */
export const documentParserResponseSchema = z.object({
  success: z.boolean(),
  data: documentParserSchema.optional(),
  error: z.string().optional()
});


