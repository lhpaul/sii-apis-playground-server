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

   ```bash
   npm install
   ```

## Usage

### Run for development

```bash
npm run dev
```

## Project Structure

```bash
context/              # Documentation for developers and vibe coding to be used as context.
src/
├── constants/        # Global constants used throughout the project
├── definitions/      # TypeScript interfaces and types for type safety
├── endpoints/        # Api endpoints configurations and handlers
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

## Deploy

This server is deployed as a Google Cloud Platform's Cloud Run service. In order to deploy you must:

1. **Install the Google Cloud CLI (`gcloud`)**
   - Follow the instructions at [Install the gcloud CLI](https://cloud.google.com/sdk/docs/install) if you haven't already.

2. **Authenticate with your Google Cloud account**
   - Run:

     ```bash
     gcloud auth login
     ```

   - Make sure you have access to the correct Google Cloud project:

     ```bash
     gcloud config set project YOUR_PROJECT_ID
     ```

3. **Ensure you have the required permissions**
   - You need permissions to use Cloud Build, Cloud Run, and Artifact Registry. Typically, you need the following roles:
     - Cloud Run Admin (`roles/run.admin`)
     - Cloud Build Editor (`roles/cloudbuild.builds.editor`)
     - Artifact Registry Writer (`roles/artifactregistry.writer`)
     - Service Account User (`roles/iam.serviceAccountUser`)
   - For more details on permissions, see the [official documentation](https://cloud.google.com/build/docs/deploying-builds/deploy-cloud-run#using-minimal-iam-permissions).

4. **Enable required APIs**
   - Enable the following APIs if not already enabled:

     ```bash
     gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
     ```

5. **Run the deploy command**

     ```bash
     npm run deploy
     ```

For more detailed instructions and troubleshooting, please refer to the [official Google Cloud Build documentation for deploying to Cloud Run](https://cloud.google.com/build/docs/deploying-builds/deploy-cloud-run).

## Project Conventions

Before starting a new development, please review the [Project Conventions] documentation inside the `/context` folder. Following these guidelines helps ensure consistency, maintainability, and smoother code reviews during Pull Requests.

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