# Dynamic Document Translator

A sophisticated multi-agent document translation system built with LangGraph that intelligently processes documents through specialized AI agents for comprehensive language translation with quality assurance.

## 🚀 Overview

This project implements a **5-agent architecture** using LangGraph to create a robust document translation pipeline. Each agent has a specialized role, enabling modular processing, quality control, and intelligent branching logic based on document characteristics and translation requirements.

## 🏗️ Multi-Agent Architecture

### Agent Roles & Responsibilities

1. **📄 Document Parser Agent**
   - Document intake and format detection
   - Text extraction from various formats (PDF, DOCX, TXT)
   - Structure preservation and metadata extraction

2. **🔍 Language Detection Agent**
   - Source language identification with confidence scoring
   - Routing logic for language-specific translation strategies
   - Support for multiple language detection models

3. **🌐 Translation Agent**
   - Core translation functionality with context preservation
   - Multi-target language support
   - Specialized handling for different language pairs

4. **✅ Quality Checker Agent**
   - Translation accuracy and fluency validation
   - Automated quality scoring
   - Retry logic for subpar translations

5. **📋 Output Formatter Agent**
   - Document structure reconstruction
   - Format preservation and styling
   - Final output generation in multiple formats

## 🎯 Features

- **Multi-format Support**: PDF, DOCX, TXT, and more
- **Intelligent Language Detection**: Automatic source language identification
- **Quality Assurance**: Built-in translation validation and retry mechanisms
- **Branching Logic**: Dynamic routing based on language and quality metrics
- **Scalable Architecture**: Modular agent design for easy extension
- **Real-time Processing**: Streaming capabilities with progress tracking
- **Multi-target Translation**: Support for translating to multiple languages simultaneously

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.4 with TypeScript
- **Multi-Agent Orchestration**: LangGraph 0.3.5
- **LLM Integration**: LangChain with OpenAI & Google Gemini support
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
   GOOGLE_API_KEY=your_google_api_key
   TAVILY_API_KEY=your_tavily_api_key
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
START → Document Parser → Language Detection → Translation Agent
                               ↓                    ↓
                    (branch by language)    (branch by target)
                               ↓                    ↓
                           Quality Checker ←────────┘
                               ↓
                    (retry if quality < threshold)
                               ↓
                         Output Formatter → END
```

## 📁 Project Structure

```
src/
├── agent/
│   ├── agents/
│   │   ├── documentParser.ts
│   │   ├── languageDetector.ts
│   │   ├── translator.ts
│   │   ├── qualityChecker.ts
│   │   └── outputFormatter.ts
│   ├── graph/
│   │   ├── translationGraph.ts
│   │   └── graphState.ts
│   ├── tools/
│   │   ├── documentTools.ts
│   │   ├── translationTools.ts
│   │   └── qualityTools.ts
│   └── utils/
│       ├── languageUtils.ts
│       └── formatUtils.ts
├── app/
│   ├── api/
│   │   └── translate/
│   └── components/
│       ├── DocumentUpload.tsx
│       ├── TranslationProgress.tsx
│       └── ResultDisplay.tsx
└── types/
    ├── document.ts
    ├── translation.ts
    └── graph.ts
```

## 🔄 Agent Communication

The agents communicate through a shared state that includes:

- **Document metadata**: Format, size, structure
- **Language information**: Source/target languages, confidence scores
- **Translation data**: Translated content, quality metrics
- **Processing status**: Current agent, completion percentage
- **Quality metrics**: Accuracy scores, validation results

## 🎛️ Configuration

### Quality Thresholds
```typescript
const qualityConfig = {
  minimumScore: 0.8,
  retryAttempts: 3,
  fallbackStrategy: 'human-review'
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