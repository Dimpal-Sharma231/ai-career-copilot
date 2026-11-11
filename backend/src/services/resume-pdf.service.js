import PDFDocument from 'pdfkit';

/**
 * Service to generate a 1-page ATS-compliant PDF resume programmatically using PDFKit.
 * Follows industry-standard ATS typography:
 * - Single column layout
 * - Clean Helvetica font (no custom non-standard webfonts)
 * - Clear, machine-readable section headings
 * - Proper line heights and bullet formatting
 */
export class ResumePdfService {
  static generateAtsResume(user, resumeData = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 36, bottom: 36, left: 40, right: 40 }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', reject);

        // ---------------- HEADER SECTION ----------------
        const name = (user.name || 'Candidate Name').toUpperCase();
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827').text(name, { align: 'center' });
        doc.moveDown(0.25);

        // Contact / Links Bar
        const contactParts = [
          user.email,
          user.college || 'Engineering College',
          `Batch ${user.graduationYear || '2026'}`
        ].filter(Boolean);

        doc.fontSize(9).font('Helvetica').fillColor('#4B5563')
          .text(contactParts.join('  |  '), { align: 'center' });

        const links = [];
        if (user.githubUrl) links.push(`GitHub: ${user.githubUrl.replace(/^https?:\/\//, '')}`);
        if (user.leetcodeUrl) links.push(`LeetCode: ${user.leetcodeUrl.replace(/^https?:\/\//, '')}`);
        
        if (links.length > 0) {
          doc.moveDown(0.15);
          doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#2563EB')
            .text(links.join('  |  '), { align: 'center' });
        }

        doc.moveDown(0.5);
        this._drawDivider(doc);

        // ---------------- TARGET ROLE / SUMMARY ----------------
        doc.moveDown(0.3);
        const targetRole = user.targetRole || 'Software Development Engineer (SDE)';
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#111827').text('CAREER OBJECTIVE');
        doc.moveDown(0.2);
        doc.fontSize(9).font('Helvetica').fillColor('#374151')
          .text(`Results-driven Engineering candidate targeting ${targetRole} positions. Strong foundation in data structures, algorithms, distributed systems, and modern web application development.`, {
            lineGap: 2
          });

        // ---------------- EDUCATION ----------------
        doc.moveDown(0.6);
        this._drawSectionHeader(doc, 'EDUCATION');
        doc.moveDown(0.25);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827')
          .text(user.college || 'College of Engineering', { continued: true })
          .font('Helvetica').fillColor('#4B5563')
          .text(`  —  Graduating Batch of ${user.graduationYear || '2026'}`, { align: 'right' });

        doc.fontSize(9).font('Helvetica').fillColor('#374151')
          .text('Bachelor of Technology (B.Tech) in Computer Science & Engineering');

        // ---------------- TECHNICAL SKILLS ----------------
        doc.moveDown(0.6);
        this._drawSectionHeader(doc, 'TECHNICAL SKILLS & COMPETENCIES');
        doc.moveDown(0.25);

        // Parse skills from user or resume
        let skills = [];
        if (user.resumeSkills) {
          try {
            skills = JSON.parse(user.resumeSkills);
          } catch {
            skills = [];
          }
        }
        if (!skills || skills.length === 0) {
          skills = ['C++', 'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Git', 'DSA', 'REST APIs'];
        }

        const languages = skills.filter(s => ['C++', 'Java', 'Python', 'TypeScript', 'JavaScript', 'Go', 'SQL', 'C', 'Rust'].includes(s));
        const frameworks = skills.filter(s => ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Tailwind CSS', 'Django'].includes(s));
        const cloudDb = skills.filter(s => ['Docker', 'AWS', 'Kubernetes', 'PostgreSQL', 'Redis', 'Git', 'CI/CD', 'MongoDB'].includes(s));
        const core = skills.filter(s => !languages.includes(s) && !frameworks.includes(s) && !cloudDb.includes(s));

        this._drawSkillLine(doc, 'Programming Languages', languages.length ? languages.join(', ') : 'C++, Python, JavaScript, Java, SQL');
        this._drawSkillLine(doc, 'Frameworks & Libraries', frameworks.length ? frameworks.join(', ') : 'React, Node.js, Express, Next.js, Tailwind CSS');
        this._drawSkillLine(doc, 'Cloud, Tools & DBs', cloudDb.length ? cloudDb.join(', ') : 'PostgreSQL, Docker, Redis, Git, Linux, RESTful APIs');
        this._drawSkillLine(doc, 'Core Fundamentals', core.length ? core.join(', ') : 'Data Structures & Algorithms, System Design, DBMS, OOP');

        // ---------------- KEY PROJECTS ----------------
        doc.moveDown(0.6);
        this._drawSectionHeader(doc, 'KEY TECHNICAL PROJECTS');
        doc.moveDown(0.25);

        // Project 1: AI Career Copilot / Platform
        this._drawProject(doc,
          'AI Career Copilot — Enterprise Placement Platform',
          'React, Node.js, Express, Python FastAPI, SQLite, Scikit-learn, TF-IDF',
          [
            'Architected full-stack career acceleration engine enabling students to calibrate resume vectors against campus job descriptions.',
            'Integrated Python microservice computing TF-IDF Cosine Similarity for skill gap identification with sub-150ms latency.',
            'Implemented stateful AI mock interview simulator assessing STAR method framework and confidence linguistic patterns.'
          ]
        );

        doc.moveDown(0.4);

        // Project 2: High-Concurrency Distributed Order Engine
        this._drawProject(doc,
          'Distributed Order Processing & Microservices Pipeline',
          'Node.js, PostgreSQL, Redis Caching, Docker, RESTful APIs',
          [
            'Designed high-throughput ordering pipeline utilizing Redis in-memory caching to eliminate redundant database read bottlenecks.',
            'Optimized SQL query indexes reducing p99 response times from 340ms to 42ms under simulated load test scenarios.',
            'Structured modular containerization using Docker compose for seamless local and production deployments.'
          ]
        );

        // ---------------- CODING ACHIEVEMENTS & METRICS ----------------
        doc.moveDown(0.6);
        this._drawSectionHeader(doc, 'COMPETITIVE PROGRAMMING & ACHIEVEMENTS');
        doc.moveDown(0.25);

        const dsaSolved = user.dsaSolved || 150;
        const streak = user.dsaStreak || 30;

        doc.fontSize(9).font('Helvetica').fillColor('#374151')
          .text(`• Solved ${dsaSolved}+ Data Structures & Algorithms problems across LeetCode, Codeforces, and GeeksforGeeks.`, { lineGap: 2 });
        doc.text(`• Maintained an active ${streak}-day continuous problem-solving streak focusing on Dynamic Programming, Graphs, and Trees.`, { lineGap: 2 });
        doc.text(`• Ranked in the top percentile of campus competitive programming challenges; verified profile completeness rating of ${user.profileStrength || 85}%.`, { lineGap: 2 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  static _drawSectionHeader(doc, title) {
    doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#111827').text(title);
    doc.moveDown(0.1);
    this._drawDivider(doc);
  }

  static _drawDivider(doc) {
    const x = doc.x;
    const y = doc.y;
    doc.strokeColor('#D1D5DB').lineWidth(0.75).moveTo(40, y).lineTo(555, y).stroke();
    doc.moveDown(0.2);
  }

  static _drawSkillLine(doc, label, list) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1F2937').text(`${label}: `, { continued: true })
      .font('Helvetica').fillColor('#4B5563').text(list);
    doc.moveDown(0.15);
  }

  static _drawProject(doc, title, techStack, bullets) {
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text(title, { continued: true })
      .font('Helvetica-Oblique').fillColor('#6B7280').text(`  [${techStack}]`);
    doc.moveDown(0.15);
    bullets.forEach(bullet => {
      doc.fontSize(8.5).font('Helvetica').fillColor('#374151')
        .text(`  •  ${bullet}`, { lineGap: 1.5 });
    });
  }
}
