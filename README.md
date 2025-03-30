# QuickContainerImageScan

**QuickContainerImageScan** is a simple and intuitive tool that automatically downloads a public container image and performs vulnerability and license checks using **Trivy**—just by entering the image name.  
Think of it like a “word counter,” but for container security, lightweight, fast, and easy to use.

## Table of Contents

- [Overview](#overview)
- [Setup and Launch](#setup-and-launch)
  - [Standard Launch](#standard-launch)
  - [Local Development Launch](#local-development-launch)
  - [Cleanup](#cleanup)
- [UI Overview](#ui-overview)
- [Tech Stack](#tech-stack)

## Overview

QuickContainerImageScan enables you to run a security check on any public container image **with a single click**, significantly improving operational efficiency.

Once an image name is entered, the following steps are executed automatically

1. Download the container image
2. Perform a vulnerability scan using Trivy
3. Conduct a license check
4. Display results visually via UI

## Setup and Launch

### Prerequisites

Make sure the following tools are installed locally

- Docker
- Kubernetes (Kind)
- kubectl
- Helm
- pnpm

### Standard Launch

To set up the entire environment and launch the application, simply run

```bash
make all
```

This command performs the following

- Creates a Kind cluster and a local container registry
- Installs and configures PostgreSQL
- Creates required Kubernetes services
- Builds and deploys the application and scan job
- Sets up port forwarding

After setup, you can access the app at: [http://localhost:8080](http://localhost:8080)

### Local Development Launch

To launch the app in a local development environment, follow these steps

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Set up shared components for development

   ```bash
   make all-app-local
   ```

   This command does the following

   - Creates a Kind cluster and a local container registry
   - Installs and configures PostgreSQL
   - Creates PostgreSQL service
   - Builds and pushes the scan job image
   - Generates job templates
   - Sets environment variables for development
   - Enables port forwarding for PostgreSQL
   - Runs Prisma migrations

3. Start the development server

   ```bash
   make local-dev
   ```

   This will run `pnpm run dev` to launch the Next.js development server.
   By default, it will be available at: [http://localhost:3000](http://localhost:3000)

### Cleanup

Once you're done, clean up the resources using

```bash
make clean
```

This command will

- Stop port forwarding
- Delete the Kind cluster
- Remove the local container registry
- Delete environment variable files

## UI Overview

- **Image Name Input Field**

  - Text input for entering a public container image name
  - Example: `docker.io/library/nginx:latest`

- **Scan Button**

  - Triggers the scan job when pressed after entering the image name
  - Once clicked, progress logs and reports appear at the bottom of the screen

- **Progress & Log Display Area**

  - Real-time display of each job step (e.g., “Downloading image,” “Running Trivy scan”)
  - Terminal-style UI helps users intuitively track execution status

- **Report Display Section**
  - Summarizes scan results, including vulnerabilities and license checks
  - Clearly presents numeric and textual data for easy review

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js (Server Actions), Prisma
- **Database**: PostgreSQL
- **Container Orchestration**: Docker, Kubernetes (Kind)
- **Scanning Tool**: Trivy
- **Others**: TypeScript, Zod
