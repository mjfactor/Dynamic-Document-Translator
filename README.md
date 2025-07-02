# Dynamic Document Translator

A sophisticated multi-agent document translation system built with LangGraph that intelligently processes documents through specialized AI agents for comprehensive language translation with quality assurance.

## 🚀 Overview

This project implements a **3-agent architecture** using LangGraph to create a robust document translation pipeline with human-in-the-loop interaction. The system processes PDF documents through specialized AI agents, preserving original formatting while providing high-quality translations.

**Workflow**: PDF Input → Document Processing & Language Detection → User Selection → Translation → Formatted PDF Output

## 🏗️ Multi-Agent Architecture

### Agent Roles, Inputs & Outputs

1. **📄 Document Parser & Language Detection Agent**
   - **Input**: PDF file (binary data/buffer)
   - **Processing**: Text extraction, format detection, structure preservation, and source language identification
   - **Output**: 
     - Extracted text content
     - Formatting metadata (fonts, layout, styling)
     - Document structure (headings, paragraphs, tables, images)
     - Original PDF metadata
     - Detected source language with confidence scoring
     - **Human-in-the-Loop**: User selects target language from available options

2. **🌐 Translation Agent** *(with integrated quality checking)*
   - **Input**: 
     - Source text content
     - Source language (detected)
     - Target language (user-selected)
     - Document context and structure
   - **Processing**: Translation with context preservation + automated quality validation
   - **Output**: 
     - High-quality translated text
     - Translation confidence metrics
     - Preserved text structure and formatting cues

3. **📋 Output Formatter Agent**
   - **Input**: 
     - Translated text content
     - Original formatting metadata
     - Document structure information
     - Original PDF styling references
   - **Processing**: PDF reconstruction with translated content
   - **Output**: 
     - **Final translated PDF file** (same/similar format as original)
     - Translation metadata and processing logs


## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.4 with TypeScript
- **Multi-Agent Orchestration**: LangGraph 0.3.5
- **LLM Integration**: LangChain with OpenAI & Google Gemini support
- **Document Processing**: Vercel AI SDK with Gemini (native PDF processing)
- **UI Framework**: React 19 with Tailwind CSS
- **Additional Tools**: Tavily Search for enhanced context
- **State Management**: LangGraph's built-in state management
- **Memory**: Persistent conversation history

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd langgraph-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🚦 Usage

### Basic Translation Workflow

```typescript
// Initialize the translation graph
const translationGraph = await createTranslationGraph();

// Process a document
const result = await translationGraph.invoke({
  document: documentFile,
  targetLanguages: ['spanish', 'french'],
  qualityThreshold: 0.8
});
```

### Graph Execution Flow

```
START → Document Parser & Language Detection → [USER SELECTS TARGET LANGUAGE] 
                     ↓                                    ↓
            (detected language & structure)        (user choice)
                     ↓                                    ↓
               Translation Agent ──────────────────→ Output Formatter → TRANSLATED PDF
                     ↓                                         ↑
          (quality validation built-in)                       ↑
                     └─────────────────────────────────────────┘
```


## 🔄 Agent Communication

The agents communicate through a shared state that includes:

- **Document metadata**: Original PDF format, size, structure, fonts
- **Extracted content**: Raw text, images, tables, formatting references  
- **Language information**: Source language, confidence scores, user-selected target language
- **Translation data**: Translated content with preserved structure markers
- **Processing status**: Current agent, completion percentage
- **Output specifications**: PDF reconstruction parameters and styling

## 🎛️ Configuration

### Quality & Processing Settings
```typescript
const translationConfig = {
  minimumConfidenceScore: 0.8,
  retryAttempts: 3,
  preserveFormatting: true,
  outputFormat: 'pdf'
};
```

### Supported Languages
- English, Spanish, French, German, Italian
- Chinese (Simplified/Traditional), Japanese, Korean
- Arabic, Russian, Portuguese
- *Extensible for additional languages*

## 🔮 Future Enhancements

- [ ] **Batch Processing**: Handle multiple documents simultaneously
- [ ] **Custom Model Integration**: Support for specialized translation models
- [ ] **Human-in-the-Loop**: Manual review and correction capabilities
- [ ] **API Integration**: RESTful API for external service integration
- [ ] **Advanced Quality Metrics**: Semantic similarity and context accuracy
- [ ] **Document Comparison**: Side-by-side original vs. translated view
- [ ] **Translation Memory**: Reuse of previous translations for consistency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangGraph Team** for the powerful multi-agent framework
- **LangChain Community** for comprehensive LLM integration tools
- **OpenAI & Google** for providing robust language models

---

*Built with ❤️ using LangGraph and Next.js*