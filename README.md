# Ramen 🍜

**Ramen is an AI-first programming language** optimized for vibe-coding.

## 🌌 Why Ramen?

Software is co-authored by humans and machines. Ramen is what happens when you design 
a language not for compilers, but for transformers. It’s structurally rich, semantically dense, and 100% GPT-friendly.

## 🌟 Current Features

This prototype demonstrates:

- **Expression-Based Language**: Programs built from composable expression types:
  - Stack expressions (sequences of statements)
  - Function calls with named functions and arguments
  - Variable assignments and references
  - While loops with conditions and bodies
  - Literal values (numbers and strings)
- **Structured Program Representation**: Programs stored as typed data structures rather than raw text
- **Interactive Development Environment**: Web-based interface for exploring language concepts
- **Type Safety**: Strong typing to ensure program correctness during construction

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js (v18 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Ramen.git
cd Ramen
```

2. Install dependencies:
```bash
bun install
```

3. Start the development environment:
```bash
bun run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 Language Design Principles

Ramen explores several key principles for AI-first language design:

- **Explicit Structure**: Every program element has a clear type and well-defined relationships
- **Compositional Semantics**: Complex behavior emerges from simple, combinable primitives  
- **Minimal Ambiguity**: Language constructs have unambiguous interpretations
- **Metadata-Rich**: Each expression carries semantic information beyond just syntax
- **Transformation-Friendly**: Programs can be easily analyzed, modified, and optimized by automated tools

The current implementation demonstrates these principles through a simple but complete expression language with variables, functions, loops, and structured control flow.

## 🏗️ Technical Implementation

This research prototype is built with:

- **React 19** - Interactive development environment
- **TypeScript** - Type safety for language definitions and tooling
- **Vite** - Fast development and build system
- **Zustand** - State management for the development environment

## 📁 Project Structure

```
src/
├── types/
│   └── ast.ts          # Core Ramen language type definitions
├── state/
│   └── index.ts        # Program state management and example programs  
├── components/         # Interactive development environment components
├── features/           # Main application interface
├── hooks/              # Development environment utilities
├── styles/             # Interface styling
└── utils/              # Helper functions
```

## 🧪 Available Scripts

- `bun run dev` - Start interactive development environment
- `bun run build` - Build the project
- `bun run preview` - Preview the built project
- `bun run lint` - Run code quality checks

## 🔬 Research Status

**Current Status**: Early prototype demonstrating core language concepts

**Implemented**:
- Basic expression type system
- Program representation as structured data
- Interactive program visualization
- Type-safe program construction

**Research Areas**:
- Runtime execution engine
- AI code generation integration
- Performance optimization for large programs
- Advanced language features (conditionals, pattern matching, etc.)
- Tooling for AI agents (parsing, generation, analysis)

## 🚀 Deployment

This research prototype can be viewed online:

1. Push changes to the `main` branch
2. GitHub Actions automatically builds and deploys
3. View at `https://yourusername.github.io/Ramen/`

## 🤝 Contributing

This is a research project exploring AI-first programming language design. Contributions welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/research-area`)
3. Commit your research (`git commit -m 'Add exploration of X concept'`)
4. Push to the branch (`git push origin feature/research-area`)
5. Open a Pull Request

## 📚 Research Context

Ramen builds on research in:
- Programming language design for AI systems
- Structured program representation
- Human-AI collaborative programming
- Domain-specific languages for code generation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Exploring programming language design for the age of AI
- Built with modern web technologies for interactive research
- Thanks to the programming language research community
