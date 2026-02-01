# Encryption Setup Guide

## Overview

The backend now encrypts sensitive data using **AES-256-GCM** encryption.

## Setup Instructions

### 1. Generate Encryption Key

Generate a secure 32-byte (256-bit) encryption key using OpenSSL:

```bash
openssl rand -hex 32
```

This will output a 64-character hexadecimal string like:

```bash
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 2. Add to Environment Variables

Add the encryption key to your `.env` file:

```env
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 3. Run Migrations

If you have existing webhook URLs, run the encryption migration to encrypt data:

```bash
npm run migrate
```

## How It Works

### Encryption Process

```bash
Plain Data
     ↓
Encryption (AES-256-GCM)
     ↓
Encrypted Data: iv:authTag:encryptedData
     ↓
Stored in DB
```
