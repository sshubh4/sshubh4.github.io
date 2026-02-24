# Shubham Sharma | Portfolio

Personal portfolio website showcasing skills, experience, projects, and certificates.

**Live site:** [sshubh4.github.io](https://sshubh4.github.io)

## Tech Stack

- HTML, CSS, JavaScript
- [PDF.js](https://mozilla.github.io/pdf.js/) for resume and certificate previews
- Google Fonts (Poppins)

## Project Structure

```
├── index.html          # Main page
├── style.css           # Styles
├── script.js           # Main scripts (resume, certificates, nav)
├── certificates.js     # Certificate data
├── resume.pdf          # Resume PDF
├── assets/             # Images (profile photo)
└── ceertificates/      # Certificate PDFs
```

## Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/sshubh4/sshubh4.github.io.git
   cd sshubh4.github.io
   ```

2. Open `index.html` in a browser, or serve with a local server:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Deploy to GitHub Pages

1. Push to the `main` branch
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main**, folder: **/ (root)**

The site will be live at `https://sshubh4.github.io`.
