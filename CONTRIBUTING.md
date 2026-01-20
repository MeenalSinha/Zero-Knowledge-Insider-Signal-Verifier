# Contributing to ZK Insider Signal Verifier

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Welcome newcomers and help them learn
- Respect different perspectives and experiences

## Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/zk-insider-verifier.git
cd zk-insider-verifier
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# Setup circuits
cd circuits && ./setup_circuit.sh && cd ..
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Workflow

### Making Changes

1. **Write Code**
   - Follow existing code style
   - Add comments for complex logic
   - Keep functions small and focused

2. **Add Tests**
   - Write tests for new features
   - Ensure existing tests still pass
   - Aim for >80% code coverage

3. **Update Documentation**
   - Update relevant README files
   - Add inline comments
   - Update CHANGELOG.md

### Code Style

**Solidity:**
```solidity
// Follow Solidity style guide
// Use NatSpec comments

/// @notice Brief description
/// @param paramName Parameter description
/// @return Description of return value
function myFunction(uint256 paramName) external returns (bool) {
    // Implementation
}
```

**Python:**
```python
# Follow PEP 8
# Use Black formatter

def my_function(param_name: str) -> bool:
    """
    Brief description.
    
    Args:
        param_name: Parameter description
    
    Returns:
        Description of return value
    """
    # Implementation
```

**JavaScript/React:**
```javascript
// Use Prettier formatter
// Prefer functional components

/**
 * Brief description
 * @param {string} propName - Prop description
 * @returns {JSX.Element}
 */
function MyComponent({ propName }) {
  // Implementation
}
```

### Running Tests

```bash
# Smart contracts
npx hardhat test

# Backend
cd backend && pytest

# All tests
npm run test:all
```

### Commit Messages

Use conventional commits:

```
feat: Add new signal type for executive exits
fix: Correct percentage calculation in analyzer
docs: Update setup guide with IPFS instructions
test: Add integration tests for bounty system
refactor: Simplify reputation calculation logic
```

Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## Pull Request Process

### 1. Before Submitting

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts

### 2. Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create PR on GitHub with:

**Title:** Clear, descriptive title

**Description:**
```markdown
## What
Brief description of changes

## Why
Reason for changes

## How
Technical approach

## Testing
How to test the changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

### 3. Review Process

- Maintainers will review within 3-5 days
- Address review comments
- Once approved, maintainers will merge

## Contribution Areas

### 🔥 High Priority

- [ ] Additional signal types (Executive Exit, Risk Language)
- [ ] ML model improvements
- [ ] Gas optimizations
- [ ] Security audits

### 💡 Good First Issues

- [ ] Add more test coverage
- [ ] Improve documentation
- [ ] Fix typos
- [ ] Add examples

### 🎨 Frontend

- [ ] New UI components
- [ ] Mobile responsiveness
- [ ] Accessibility improvements
- [ ] Dark/light theme toggle

### 🔧 Backend

- [ ] API endpoints
- [ ] Caching layer
- [ ] Rate limiting
- [ ] Error handling

### ⚡ Smart Contracts

- [ ] Gas optimizations
- [ ] Additional functionality
- [ ] Security improvements
- [ ] Upgradability

## Specific Guidelines

### Adding New Signal Types

1. Create signal spec in `docs/signal-specs/`
2. Add detection logic in `backend/analyzer.py`
3. Update `SignalType` enum in contract
4. Add tests
5. Update documentation

### Improving ZK Circuits

1. Modify circuit in `circuits/`
2. Recompile with `./setup_circuit.sh`
3. Test with sample inputs
4. Verify proof generation works
5. Update integration

### Enhancing UI

1. Follow brutalist design aesthetic
2. Use existing color scheme
3. Ensure mobile responsive
4. Test with different wallets
5. Add loading states

## Testing Guidelines

### Writing Tests

```javascript
// Smart contract tests
describe("Feature", function () {
  it("Should do expected behavior", async function () {
    // Setup
    // Execute
    // Assert
  });
});
```

```python
# Backend tests
def test_feature():
    """Test description"""
    # Arrange
    # Act
    # Assert
    assert result == expected
```

### Test Coverage

- Aim for >80% coverage
- Test edge cases
- Test error conditions
- Integration tests for workflows

## Documentation

### Types of Documentation

1. **Code Comments**
   - Explain why, not what
   - Document complex logic
   - Use clear language

2. **README Files**
   - Setup instructions
   - Usage examples
   - Troubleshooting

3. **API Documentation**
   - Endpoint descriptions
   - Request/response examples
   - Error codes

4. **Technical Docs**
   - Architecture decisions
   - Security considerations
   - Performance optimizations

## Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: security@zkinsider.example
2. Include detailed description
3. Steps to reproduce
4. Potential impact

### Security Guidelines

- Never commit secrets
- Validate all inputs
- Use latest dependencies
- Follow security best practices
- Run static analysis tools

## Community

### Getting Help

- GitHub Discussions: General questions
- GitHub Issues: Bug reports and features
- Discord: Real-time chat (if available)

### Communication

- Be patient and respectful
- Provide context and details
- Share what you've tried
- Help others when you can

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please:
1. Check existing documentation
2. Search closed issues/PRs
3. Open a GitHub Discussion
4. Contact maintainers

---

Thank you for contributing to ZK Insider Signal Verifier! 🎉
