# Contributing to Chatalyze 🎯

First off, thank you for considering contributing to Chatalyze! It's people like you that make this tool better for everyone. 💚

## 🌟 Ways to Contribute

### 🐛 Bug Reports

Found a bug? Help us fix it by providing:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Platform/browser** information
- **Sample data** (anonymized) if relevant

### 💡 Feature Requests

Have an idea? We'd love to hear it! Please include:

- **Clear description** of the feature
- **Use case** - why would this be helpful?
- **Proposed solution** (if you have one)
- **Alternatives** you've considered

### 🔧 Code Contributions

Ready to code? Awesome! Please follow these steps:

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of TypeScript/React

### Development Setup

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/yourusername/chatalyze.git
   cd chatalyze
   ```

3. **Install** dependencies:

   ```bash
   npm install
   ```

4. **Start** the development server:

   ```bash
   npm run dev
   ```

5. **Create** a new branch for your feature:

   ```bash
   git checkout -b feature/amazing-new-feature
   ```

## 🎯 Development Guidelines

### Code Style

- **TypeScript** - Use TypeScript for all new code
- **ESLint** - Follow the existing ESLint configuration
- **Prettier** - Code will be automatically formatted
- **Components** - Use functional components with hooks

### Naming Conventions

- **Files**: PascalCase for components (`ChatAnalyzer.tsx`)
- **Functions**: camelCase (`parseWhatsAppData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types**: PascalCase (`ChatMessage`, `Platform`)

### Project Structure

```text
src/
├── components/          # React components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── data/               # Sample data and schemas
```

### Adding Platform Support

To add a new messaging platform:

1. **Add platform type** in `src/types/chat.ts`
2. **Create transformer** in `src/utils/chatUtils.ts`
3. **Add sample data** in `sample_data/`
4. **Update UI** in `UploadInterface.tsx`
5. **Add tests** for the new transformer

### Testing

- Write **unit tests** for utilities (`*.test.ts`)
- Test with **real export files** from platforms
- Ensure **privacy compliance** (no data leaves browser)

## 📝 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No console errors or warnings
- [ ] Documentation updated (if needed)
- [ ] Sample data provided (for new platforms)

### PR Guidelines

1. **Small, focused** changes are preferred
2. **Clear title** describing the change
3. **Detailed description** with:
   - What changed and why
   - How to test the changes
   - Screenshots (for UI changes)
   - Breaking changes (if any)

### Review Process

- Maintainers will review within **48-72 hours**
- Address feedback **promptly**
- Keep PR **up to date** with main branch
- **Squash commits** before merging

## 🛡️ Privacy & Security

Chatalyze is **privacy-first**. When contributing:

- **No external APIs** for data processing
- **Local processing only** - data never leaves browser
- **No tracking or analytics** code
- **Secure file handling** practices

## 📋 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation updates
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `platform:whatsapp` - WhatsApp-specific issues

## 🎨 Design Guidelines

- **Mobile-first** responsive design
- **Accessibility** - semantic HTML, ARIA labels
- **Dark/light theme** support
- **Consistent spacing** using Tailwind classes
- **Loading states** for file processing

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## 💬 Getting Help

- **GitHub Issues** - Technical questions
- **GitHub Discussions** - General questions
- **Website** - [lusansapkota.com.np](https://lusansapkota.com.np)

## 🏆 Recognition

Contributors will be:

- **Listed** in our README
- **Mentioned** in release notes
- **Credited** for their contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

## ❤️ Thank You

Every contribution, no matter how small, makes a difference. Thank you for helping make Chatalyze better for everyone!

**Happy coding!** 🚀

---

*For questions about contributing, feel free to open an issue or visit [lusansapkota.com.np](https://lusansapkota.com.np)*
