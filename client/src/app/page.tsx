'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const featureItems = [
  {
    title: 'Easy Complaint Submission',
    description: 'Intuitive reporting with smart categorization and instant tracking IDs.',
    icon: FileText,
  },
  {
    title: 'Fast & Transparent Processing',
    description: 'Live status updates, SLA visibility, and accountable resolution flow.',
    icon: Sparkles,
  },
  {
    title: 'Secure & Efficient Resolution',
    description: 'Role-based access, audit trails, and secure citizen data handling.',
    icon: ShieldCheck,
  },
];

const statItems = [
  { value: '10K+', label: 'Active Users' },
  { value: '25K+', label: 'Complaints Resolved' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '50+', label: 'Departments Connected' },
];

export default function LandingPage() {
  return (
    <div className="landing-page" id="home">
      <header className="landing-nav">
        <div className="landing-brand">
          <span className="landing-mark" />
          <div>
            <p className="landing-brand-title">Smart Grievance</p>
            <p className="landing-brand-subtitle">Intelligence System</p>
          </div>
        </div>
        <nav className="landing-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="landing-cta">
          <Link href="/portal" className="landing-btn secondary">
            View Dashboard
          </Link>
          <Link href="/portal" className="landing-btn primary">
            Get Started
          </Link>
        </div>
      </header>

      <section className="landing-hero landing-section">
        <div className="landing-hero-content">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="landing-eyebrow"
          >
            Unified civic operations and citizen experience
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Streamline Public Grievances, <span>Improve Governance</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="landing-hero-subtitle"
          >
            Our unified complaint platform empowers citizens and government teams to resolve
            grievances quickly, transparently, and with measurable accountability.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="landing-hero-actions"
          >
            <Link href="/portal" className="landing-btn primary">
              Report a Complaint
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/portal" className="landing-btn ghost">
              View Dashboard
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="landing-hero-visual"
        >
          <div className="landing-city">
            <div className="landing-city-card">
              <p className="landing-city-title">Unified Control Center</p>
              <div className="landing-city-grid">
                <div>
                  <span>312</span>
                  <p>Open Tickets</p>
                </div>
                <div>
                  <span>91%</span>
                  <p>On-Time SLA</p>
                </div>
                <div>
                  <span>24m</span>
                  <p>Avg Response</p>
                </div>
              </div>
            </div>
            <div className="landing-device">
              <div className="landing-device-header">
                <div className="landing-device-dot" />
                <div className="landing-device-dot" />
                <div className="landing-device-dot" />
              </div>
              <div className="landing-device-body">
                <div className="landing-device-row">
                  <span className="status">High Priority</span>
                  <span>Sector 14 - Water</span>
                </div>
                <div className="landing-device-row">
                  <span className="status warning">In Progress</span>
                  <span>Ward 22 - Roads</span>
                </div>
                <div className="landing-device-row">
                  <span className="status success">Resolved</span>
                  <span>Zone 9 - Sanitation</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="landing-stats landing-section">
        {statItems.map((item) => (
          <div key={item.label} className="landing-stat">
            <h3>{item.value}</h3>
            <p>{item.label}</p>
          </div>
        ))}
      </section>

      <section id="about" className="landing-about landing-section">
        <div className="landing-about-card">
          <h2>About the Platform</h2>
          <p>
            Smart Grievance Intelligence System unifies citizen requests, department
            actions, and leadership insights in one trusted platform. Built for real
            governance workflows, it ensures every complaint is assigned, tracked, and resolved
            with full auditability.
          </p>
          <div className="landing-about-grid">
            <div>
              <Users className="w-5 h-5" />
              <span>Citizen-first experience</span>
            </div>
            <div>
              <Building2 className="w-5 h-5" />
              <span>Department visibility</span>
            </div>
            <div>
              <CheckCircle2 className="w-5 h-5" />
              <span>Verified resolution paths</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-features landing-section">
        <div className="landing-section-title">
          <h2>Core Features</h2>
          <p>Everything required for an enterprise-grade grievance workflow.</p>
        </div>
        <div className="landing-feature-grid">
          {featureItems.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="landing-feature-card"
              >
                <div className="landing-feature-icon">
                  <Icon className="w-5 h-5" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="contact" className="landing-contact landing-section">
        <div className="landing-section-title">
          <h2>Contact & Support</h2>
          <p>Reach the civic operations team for onboarding and integration.</p>
        </div>
        <div className="landing-contact-grid">
          <div className="landing-contact-card">
            <div>
              <Mail className="w-5 h-5" />
              <span>support@smartgrievance.gov</span>
            </div>
            <div>
              <Phone className="w-5 h-5" />
              <span>+91 1800 000 001</span>
            </div>
            <div>
              <MapPin className="w-5 h-5" />
              <span>Delhi NCR Operations Center</span>
            </div>
          </div>
          <form className="landing-contact-form">
            <input type="text" placeholder="Full name" />
            <input type="email" placeholder="Work email" />
            <input type="text" placeholder="Department / Organization" />
            <textarea rows={4} placeholder="How can we help you?" />
            <button type="button" className="landing-btn primary">
              Submit Request
            </button>
          </form>
        </div>
      </section>

      <footer className="landing-footer landing-section">
        <p>Smart Grievance Intelligence System • Built for public service excellence.</p>
      </footer>
    </div>
  );
}
