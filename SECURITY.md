# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within bharat-ui, please email **f20250188@pilani.bits-pilani.ac.in**. All security vulnerabilities will be promptly addressed.

Please do not report security vulnerabilities through public GitHub issues.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Scope note

bharat-ui performs **structural validation only**. It cannot verify that a UPI ID,
PAN, or bank account actually exists — that requires a server-side call to NPCI via
your PSP. Treating a `valid: true` result as proof of a real account is a
misuse of the library, not a vulnerability in it.
