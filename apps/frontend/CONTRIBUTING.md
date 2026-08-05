# Contributing Guidelines - UPSA Hostel Management System

## Overview
Thank you for your interest in contributing to the UPSA Hostel Management System! This guide will help you get started with contributing to our project.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community Guidelines](#community-guidelines)

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher
- Git
- PostgreSQL 14.x or higher
- Redis 6.x or higher

### Setup Instructions
1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork locally
   git clone https://github.com/YOUR_USERNAME/hostel-management-system.git
   cd hostel-management-system
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment template
   cp .env.example .env.local
   
   # Set up database
   npx prisma migrate dev
   npx prisma generate
   
   # Seed database (optional)
   npx prisma db seed
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Verify Setup**
   - Open http://localhost:3000
   - Run tests: `npm test`
   - Check linting: `npm run lint`

---

## Development Workflow

### 1. Create a Branch
```bash
# Create feature branch from main
git checkout -b feature/your-feature-name

# Or create bugfix branch
git checkout -b bugfix/issue-description
```

### 2. Make Changes
- Follow code standards (see below)
- Write tests for new features
- Update documentation
- Commit frequently with clear messages

### 3. Test Your Changes
```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.test.ts

# Run linting
npm run lint

# Type checking
npm run type-check
```

### 4. Submit Pull Request
- Push your branch to your fork
- Create pull request against main branch
- Fill out PR template completely
- Wait for code review

### Branch Naming Conventions
- `feature/feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `docs/documentation-update` - Documentation changes
- `refactor/code-improvement` - Code refactoring
- `test/add-tests` - Adding tests

### Commit Message Format
Follow conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add two-factor authentication

Implement TOTP-based two-factor authentication for enhanced security.
Add QR code generation and verification process.

Closes #123
```

```
fix(rooms): resolve room allocation conflict

Fix issue where double booking was allowed in concurrent requests.
Add database transaction to prevent race conditions.
```

---

## Code Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

```typescript
// Good example
/**
 * Calculates room occupancy rate for a given hostel
 * @param hostelId - The ID of the hostel
 * @param semester - Academic semester
 * @returns Occupancy rate as percentage (0-100)
 */
export function calculateOccupancyRate(
  hostelId: string,
  semester: string
): number {
  // Implementation
}
```

### React Components
- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use TypeScript interfaces for props

```typescript
// Component structure
interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  className?: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit,
  className = ''
}) => {
  // Component logic
  return (
    <div className={`student-card ${className}`}>
      {/* JSX content */}
    </div>
  );
};
```

### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use semantic HTML elements
- Implement proper accessibility

```tsx
// Good example
<div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Student Information</h2>
  <p className="text-sm text-gray-600">Additional details</p>
</div>
```

### Database/Prisma
- Follow Prisma best practices
- Use descriptive model names
- Implement proper relationships
- Add indexes for performance

```prisma
// Example model
model Student {
  id          String   @id @default(cuid())
  email       String   @unique
  indexNumber String   @unique
  firstName   String
  lastName    String
  program     String
  level       String
  
  // Relations
  allocations RoomAllocation[]
  payments    Payment[]
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("students")
}
```

### API Routes
- Follow RESTful conventions
- Implement proper error handling
- Use consistent response format
- Add input validation

```typescript
// Example API route
export async function GET(request: NextRequest) {
  try {
    // Validate request
    const validation = await validateRequest(request, {
      requireAuth: true,
      rateLimitType: 'general'
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Process request
    const data = await getStudents();

    return NextResponse.json({
      success: true,
      data,
      message: 'Students retrieved successfully'
    });

  } catch (error) {
    console.error('Error:', errorGET Students', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Testing Guidelines

### Unit Tests
- Test individual functions and components
- Use Jest and React Testing Library
- Aim for 80%+ code coverage
- Test both happy path and error cases

```typescript
// Example unit test
describe('calculateOccupancyRate', () => {
  it('should return correct occupancy rate', () => {
    const result = calculateOccupancyRate('hostel-1', 'first');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('should handle invalid hostel ID', () => {
    expect(() => calculateOccupancyRate('', 'first')).toThrow();
  });
});
```

### Integration Tests
- Test API endpoints
- Test database operations
- Test component interactions
- Use test database

```typescript
// Example integration test
describe('POST /api/students', () => {
  it('should create new student', async () => {
    const studentData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@upsamail.edu.gh',
      indexNumber: '12345678'
    };

    const response = await request(app)
      .post('/api/students')
      .send(studentData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(studentData.email);
  });
});
```

### Component Tests
- Test component rendering
- Test user interactions
- Test accessibility features
- Use React Testing Library

```typescript
// Example component test
describe('StudentCard', () => {
  const mockStudent = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@upsamail.edu.gh'
  };

  it('renders student information correctly', () => {
    render(<StudentCard student={mockStudent} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@upsamail.edu.gh')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<StudentCard student={mockStudent} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockStudent);
  });
});
```

### E2E Tests
- Test user workflows
- Use Playwright or Cypress
- Test critical user paths
- Run in CI/CD pipeline

```typescript
// Example E2E test
test('student can view and update profile', async ({ page }) => {
  // Login as student
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'student@upsamail.edu.gh');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login-button]');

  // Navigate to profile
  await page.click('[data-testid=profile-link]');
  
  // Verify profile loads
  await expect(page.locator('[data-testid=profile-name]')).toBeVisible();
  
  // Update profile
  await page.fill('[data-testid=phone-input]', '+233123456789');
  await page.click('[data-testid=save-button]');
  
  // Verify update
  await expect(page.locator('[data-testid=success-message]')).toBeVisible();
});
```

---

## Documentation

### Code Documentation
- Add JSDoc comments to functions
- Document complex algorithms
- Explain business logic
- Use TypeScript for self-documenting code

### API Documentation
- Update API documentation for new endpoints
- Include request/response examples
- Document error codes
- Update OpenAPI specification

### Component Documentation
- Add Storybook stories for components
- Document component props
- Include usage examples
- Document accessibility features

### README Updates
- Update README for major features
- Add installation instructions
- Include contribution guidelines
- Update deployment instructions

---

## Pull Request Process

### Before Submitting
1. **Code Review Checklist**
   - [ ] Code follows project standards
   - [ ] Tests are included and passing
   - [ ] Documentation is updated
   - [ ] No console.log statements
   - [ ] No commented out code
   - [ ] Proper error handling
   - [ ] Accessibility considerations

2. **Testing Checklist**
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Component tests pass
   - [ ] Manual testing completed
   - [ ] Cross-browser testing (if applicable)

3. **Documentation Checklist**
   - [ ] README updated (if needed)
   - [ ] API docs updated (if needed)
   - [ ] Component docs updated (if needed)
   - [ ] Comments added for complex code

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Cross-browser testing completed

## Checklist
- [ ] My code follows the project's code standards
- [ ] I have performed self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Context
Add any other context about the problem here.
```

### Review Process
1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Code quality checks
   - Security scans
   - Performance tests

2. **Code Review**
   - At least one team member review
   - Address all feedback
   - Update based on suggestions

3. **Merge**
   - Merge after approval
   - Delete feature branch
   - Update documentation

---

## Issue Reporting

### Bug Reports
Use the following template for bug reports:

```markdown
**Bug Description**
Clear and concise description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
Add screenshots to help explain your problem.

**Environment**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**Additional Context**
Add any other context about the problem here.
```

### Feature Requests
Use the following template for feature requests:

```markdown
**Feature Description**
Clear and concise description of the feature.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How would you like this feature to work?

**Alternatives Considered**
What alternative solutions did you consider?

**Additional Context**
Add any other context about the feature request here.
```

### Security Issues
For security vulnerabilities:
- Do not open public issues
- Email security@upsamail.edu.gh
- Include detailed description
- Provide reproduction steps
- Include impact assessment

---

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Accept and provide feedback gracefully
- Be patient with different skill levels

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time discussion and help
- **Email**: security@upsamail.edu.gh (security issues only)

### Meeting Etiquette
- Come prepared to meetings
- Stay on topic
- Respect time limits
- Follow up on action items

### Recognition
- Acknowledge contributions
- Celebrate milestones
- Thank contributors
- Share success stories

---

## Development Tools

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Prisma
- GitLens
- Thunder Client (for API testing)

### Useful Commands
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking

# Database
npx prisma migrate dev    # Run migrations
npx prisma generate        # Generate client
npx prisma studio          # Open database studio
npx prisma db seed         # Seed database

# Documentation
npm run storybook         # Start Storybook
npm run docs:dev          # Start docs server
```

### Git Hooks
We use Husky for Git hooks:
- **pre-commit**: Run linting and formatting
- **commit-msg**: Validate commit message format
- **pre-push**: Run tests

---

## Release Process

### Version Management
- Follow semantic versioning (semver)
- Update CHANGELOG.md for releases
- Tag releases in Git
- Update package.json version

### Release Checklist
1. **Preparation**
   - All tests passing
   - Documentation updated
   - CHANGELOG updated
   - Version bumped

2. **Release**
   - Create release tag
   - Generate release notes
   - Deploy to production
   - Monitor for issues

3. **Post-Release**
   - Monitor performance
   - Address any issues
   - Update documentation
   - Announce release

---

## Getting Help

### Resources
- **Documentation**: `/docs/` directory
- **API Reference**: `/docs/API.md`
- **Component Library**: Storybook
- **Database Schema**: `/docs/DATABASE_SCHEMA.md`

### Support Channels
- **GitHub Discussions**: General questions and discussions
- **Issues**: Bug reports and feature requests
- **Discord**: Real-time help and collaboration
- **Email**: support@upsamail.edu.gh (for urgent issues)

### Mentorship
- New contributors can request a mentor
- Regular office hours for questions
- Code review pair programming
- Learning resources and tutorials

---

## Recognition and Rewards

### Contributor Recognition
- Contributors list in README
- Annual contributor awards
- Feature spotlights in blog posts
- Conference speaking opportunities

### Ways to Contribute
- Code contributions
- Documentation improvements
- Bug reports and testing
- Community support
- Design and UX improvements
- Translation and localization

Thank you for contributing to the UPSA Hostel Management System! Your contributions help make our project better for everyone.
