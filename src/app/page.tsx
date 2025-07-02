'use client';

import { useState } from 'react';
import { DocumentParserResult } from '@/lib/types';

// Types matching the API response
type DocumentParserResponse = {
  success: boolean;
  data?: DocumentParserResult;
  error?: string;
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DocumentParserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Reset previous results
      setResult(null);
      setError(null);

      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        setSelectedFile(null);
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      const response = await fetch('/api/document-parser', {
        method: 'POST',
        body: formData,
      });

      const data: DocumentParserResponse = await response.json();
      setResult(data);

      if (!data.success) {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Document Parser Agent</h1>
          <p className="text-muted-foreground">
            Advanced PDF analysis with structure preservation, format detection, and comprehensive metadata extraction
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="file-input" className="block text-sm font-medium mb-2">
                Select PDF File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 border border-border rounded-md"
                disabled={isLoading}
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Upload & Extract Text'}
              </button>

              {(selectedFile || result) && (
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Extracting text from PDF...</span>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {result.success && result.data ? (
              <>
                {/* Metadata Overview */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Document Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Filename:</span>
                      <div className="font-medium">{result.data.metadata.filename}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">File Size:</span>
                      <div className="font-medium">{formatFileSize(result.data.metadata.fileSize)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pages:</span>
                      <div className="font-medium">{result.data.metadata.pageCount || result.data.structure.totalPages}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Language:</span>
                      <div className="font-medium">{result.data.metadata.language || 'Auto-detected'}</div>
                    </div>
                    {result.data.metadata.title && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Title:</span>
                        <div className="font-medium">{result.data.metadata.title}</div>
                      </div>
                    )}
                    {result.data.metadata.author && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Author:</span>
                        <div className="font-medium">{result.data.metadata.author}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Text Quality:</span>
                      <div className="font-medium capitalize">{result.data.metadata.textQuality}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <div className="font-medium">{Math.round(result.data.metadata.extractionConfidence * 100)}%</div>
                    </div>
                  </div>
                </div>

                {/* Document Structure */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Document Structure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Sections:</span>
                      <div className="font-medium">{result.data.structure.sections.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Headings:</span>
                      <div className="font-medium">
                        {result.data.structure.sections.filter(s => s.type === 'heading').length}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tables:</span>
                      <div className="font-medium">
                        {result.data.structure.sections.filter(s => s.type === 'table').length}
                      </div>
                    </div>
                  </div>

                  {/* Section types breakdown */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Content Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(result.data.structure.sections.map(s => s.type))).map(type => (
                        <span key={type} className="px-2 py-1 bg-muted rounded-md text-xs capitalize">
                          {type} ({result.data!.structure.sections.filter(s => s.type === type).length})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Formatting Information */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Document Formatting</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Layout:</h4>
                      <div className="text-sm space-y-1">
                        <div>Columns: {result.data.formatting.layout.columns}</div>
                        <div>Orientation: {result.data.formatting.layout.orientation}</div>
                        <div>Has Headers: {result.data.formatting.layout.hasHeaders ? 'Yes' : 'No'}</div>
                        <div>Has Footers: {result.data.formatting.layout.hasFooters ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Text Styles:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.data.formatting.styles).map(([style, hasStyle]) =>
                          hasStyle && style.startsWith('has') ? (
                            <span key={style} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                              {style.replace('has', '').toLowerCase()}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>

                  {result.data.formatting.fonts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Fonts Detected:</h4>
                      <div className="text-sm space-y-1">
                        {result.data.formatting.fonts.slice(0, 5).map((font, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{font.name}</span>
                            <span className="text-muted-foreground">{font.size}pt</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Quality Indicators */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{result.data.metadata.wordCount || 'N/A'}</div>
                      <div className="text-muted-foreground">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{result.data.metadata.characterCount || result.data.extractedText.length}</div>
                      <div className="text-muted-foreground">Characters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{result.data.metadata.hasImages ? 'Yes' : 'No'}</div>
                      <div className="text-muted-foreground">Images</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{result.data.metadata.hasTables ? 'Yes' : 'No'}</div>
                      <div className="text-muted-foreground">Tables</div>
                    </div>
                  </div>
                </div>

                {/* Extracted Text */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Extracted Text Content</h3>
                  <div className="bg-muted/50 border border-border rounded-md p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                      {result.data.extractedText}
                    </pre>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {result.data.extractedText.length} characters • Extracted at {new Date(result.data.metadata.extractedAt).toLocaleString()}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
                <p className="text-destructive">{result.error || 'Unknown error occurred'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
