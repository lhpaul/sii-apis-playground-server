# SII APIs Playground Server

This repository contains the server which serves the SII APIs Playground app with services.

## Table of Contents

- [SII APIs Playground Server](#sii-apis-playground-server)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [Usage](#usage)
    - [Run for development](#run-for-development)
  - [Project Structure](#project-structure)
  - [Testing](#testing)
    - [Code Coverage](#code-coverage)
  - [Project Conventions](#project-conventions)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

## Usage

### Run for development

```
npm run dev
```

## Project Structure

```
context/              # Documentation for developers and vibe coding to be used as context.
src/
├── constants/        # Global constants used throughout the project
├── definitions/       # TypeScript interfaces and types for type safety
├── services/         # Business logic and service layer implementations
├── utils/            # Reusable utility functions
├── index.ts          # Main application entry point
├── routes.ts         # API route definitions and handlers
└── server.ts         # Server configuration and initialization
```

## Testing

Run the test suite with:

```bash
npm test
```

### Code Coverage

To generate a code coverage report, use:

```bash
npm run test:coverage
```

This command will create coverage files in the `./coverage` directory. For a human-readable report, open `./coverage/lcov-report/index.html` in your web browser.

## Project Conventions

Before starting a new development, please review the [Project Conventions](context/CONVENTIONS.md) documentation. Following these guidelines helps ensure consistency, maintainability, and smoother code reviews during Pull Requests.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback, please contact [lhpaul11@gmail.com](mailto:lhpaul11@gmail.com).
