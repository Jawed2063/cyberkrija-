# CyberForge Ultra – Dataset Provenance

## Overview
The `tools.json` dataset contains real cybersecurity tools sourced from authoritative, publicly available references. All tools listed are genuine, widely-used, open-source or commercially available security tools.

## Sources
- **Kali Linux tool listings**: https://www.kali.org/tools/ — the official Kali Linux tools page lists all packages available in the distribution.
- **Parrot OS tool listings**: https://parrotsec.org/docs/
- **SecTools.org Top 125 Network Security Tools**: https://sectools.org/
- **Awesome-Hacking GitHub list**: https://github.com/Hack-with-Github/Awesome-Hacking
- **Awesome-Security GitHub list**: https://github.com/sbilly/awesome-security
- **OWASP Testing Guide**: https://owasp.org/www-project-web-security-testing-guide/
- **SANS Institute Tool Listings**: https://www.sans.org/

## Generation Method
Tool entries were compiled manually by cross-referencing tool names, descriptions, and command examples from their official documentation and GitHub repositories. Where commands could not be verified, the `commands` array was left empty and a `notes` field was added with "needs enrichment".

## Date
Generated: March 2026

## Disclaimer
All tools are listed for **educational purposes only**. Use only on systems and networks you own or have explicit written authorization to test.
