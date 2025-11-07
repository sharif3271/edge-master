import React, { useRef, useEffect, useState } from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import CodeBlock from '@theme/CodeBlock'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'

import Features from '../components/Feature.js'
import Highlight from '../components/Highlight.js'
import Logo from '../../static/img/logo.svg'

import styles from './styles.module.css'
import {
  features,
  HelloWorldExample,
  RestAPIExample,
  AuthenticationExample,
  ProductionExample,
  comparisonData
} from '../constants.js'
import '../utils/libs/Ribbons.js'

function Home() {
  const ref = useRef(null)
  const [activeTab, setActiveTab] = useState('hello')

  useEffect(() => {
    // eslint-disable-next-line no-undef
    new Ribbons({
      colorSaturation: '86.2%',
      colorBrightness: '57.3%',
      colorAlpha: 0.3,
      colorCycleSpeed: 5,
      verticalPosition: 'random',
      horizontalSpeed: 100,
      ribbonCount: 5,
      strokeSize: 1,
      parallaxAmount: -0.2,
      animateSections: true,
      element: ref.current
    })
  })

  const context = useDocusaurusContext()
  const { siteConfig = {} } = context

  const codeExamples = {
    hello: { code: HelloWorldExample, title: 'Hello World' },
    rest: { code: RestAPIExample, title: 'REST API' },
    auth: { code: AuthenticationExample, title: 'Authentication' },
    production: { code: ProductionExample, title: 'Production Setup' }
  }

  return (
    <Layout
      title={`${siteConfig.title} · ${siteConfig.tagline}`}
      description={`${siteConfig.tagline}`}>

      {/* Hero Section */}
      <header className={clsx('hero hero--primary stmsrc', styles.heroBanner)} ref={ref}>
        <div className="container">
          <h1 className="hero__title">
            <Logo />
          </h1>
          <p className={styles.heroSubtitle}>Tame Edge Complexity with Structure and Scale</p>
          <p className={styles.heroDescription}>
            A lightweight microframework purpose-built for edge environments.
            Manage complex Cloudflare Workers applications with structured routing,
            built-in interceptors, and zero dependencies.
          </p>

          {/* Badges */}
          <div className={styles.badges}>
            <span className={styles.badge}>⚡ ~14 KB</span>
            <span className={styles.badge}>📦 Zero Dependencies</span>
            <span className={styles.badge}>🛡️ 94.65% Coverage</span>
            <span className={styles.badge}>💎 TypeScript</span>
          </div>

          {/* CTA Buttons */}
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--primary button--lg',
                styles.primaryButton,
              )}
              to={useBaseUrl('/docs/getting-started/')}>
              Get Started →
            </Link>
            <Link
              to="/docs/Intro/#why-edgemaster"
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.secondaryButton,
              )}
            >Why EdgeMaster?</Link>
            <Link
              target='_blank'
              to="https://github.com/Sharif3271/edge-master"
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.secondaryButton,
              )}
            >⭐ Star on GitHub</Link>
          </div>

          {/* Quick Code Snippet */}
          <div className={styles.heroCode}>
            <CodeBlock language="typescript">{`import { EdgeController, RouteHandler, Task, json } from 'edge-master';

const app = new EdgeController();
app.GET('/hello', new RouteHandler(new Task({
  do: async () => json({ message: 'Hello World!' })
})));`}</CodeBlock>
          </div>

          <Features features={features} />
        </div>
      </header>

      <main>
        {/* Quick Start Section */}
        <section className={styles.quickStart}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Deploy in 60 Seconds</h2>
            <p className={styles.sectionSubtitle}>From zero to production in three simple steps</p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h3>Install</h3>
                <CodeBlock language="bash">npm install edge-master</CodeBlock>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h3>Write</h3>
                <CodeBlock language="typescript">{`app.GET('/api', handler);`}</CodeBlock>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h3>Deploy</h3>
                <CodeBlock language="bash">npx wrangler deploy</CodeBlock>
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples with Tabs */}
        <Highlight
          img={
            <div>
              <div className={styles.tabContainer}>
                {Object.entries(codeExamples).map(([key, { title }]) => (
                  <button
                    key={key}
                    className={clsx(styles.tab, activeTab === key && styles.activeTab)}
                    onClick={() => setActiveTab(key)}
                  >
                    {title}
                  </button>
                ))}
              </div>
              <CodeBlock language="typescript">
                {codeExamples[activeTab].code}
              </CodeBlock>
            </div>
          }
          isDark
          title="Modern API. Production Ready."
          text={
            <>
              <p>
                EdgeMaster provides a <b>clean, expressive API</b> designed for building scalable edge applications.
                From simple routes to complex authentication flows, every feature is built with developer experience in mind.
              </p>
              <ul className={styles.featureList}>
                <li>✅ <b>HTTP Method Helpers</b> - GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS</li>
                <li>✅ <b>Route Grouping</b> - Organize with nested prefixes and hierarchies</li>
                <li>✅ <b>Built-in Interceptors</b> - JWT, CORS, rate limiting, caching, logging</li>
                <li>✅ <b>Request/Response Helpers</b> - json(), parseJSON(), badRequest(), etc.</li>
                <li>✅ <b>Error Handling</b> - Custom 404 and 500 handlers</li>
                <li>✅ <b>Context State</b> - Share data between middleware and handlers</li>
              </ul>
            </>
          }
        />

        {/* Built for Production Section */}
        <section className={styles.productionSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Built for Production</h2>
            <p className={styles.sectionSubtitle}>Enterprise-grade features out of the box</p>
            <div className={styles.productionGrid}>
              <div className={styles.productionCard}>
                <div className={styles.productionIcon}>🔒</div>
                <h3>Authentication</h3>
                <p>JWT and API key interceptors with exclude patterns and custom error handling.</p>
              </div>
              <div className={styles.productionCard}>
                <div className={styles.productionIcon}>🚦</div>
                <h3>Rate Limiting</h3>
                <p>Memory or KV-backed storage with per-IP or custom key generation.</p>
              </div>
              <div className={styles.productionCard}>
                <div className={styles.productionIcon}>⚡</div>
                <h3>Caching</h3>
                <p>Cloudflare Cache API integration with configurable TTL and cache keys.</p>
              </div>
              <div className={styles.productionCard}>
                <div className={styles.productionIcon}>📝</div>
                <h3>Logging</h3>
                <p>Request/response logging with timing, headers, and body options.</p>
              </div>
              <div className={styles.productionCard}>
                <div className={styles.productionIcon}>🔄</div>
                <h3>CORS</h3>
                <p>Full CORS support with automatic OPTIONS handling and credentials.</p>
              </div>
              <div className={styles.productionCard}>
                <div className={styles.productionIcon}>🛡️</div>
                <h3>Error Handling</h3>
                <p>Built-in error boundaries with custom 404 and 500 handlers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className={styles.comparisonSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Why Choose EdgeMaster?</h2>
            <p className={styles.sectionSubtitle}>Purpose-built for edge complexity management</p>
            <div className={styles.comparisonTable}>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>EdgeMaster</th>
                    <th>Express.js</th>
                    <th>Hono</th>
                    <th>itty-router</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx}>
                      <td><b>{row.feature}</b></td>
                      <td className={styles.highlight}>{row.edgemaster}</td>
                      <td>{row.express}</td>
                      <td>{row.hono}</td>
                      <td>{row.ittyRouter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <Highlight
          img={
            <div className={styles.useCasesList}>
              <div className={styles.useCase}>
                <h4>🌐 API Gateways</h4>
                <p>Route requests with validation, auth, and rate limiting built-in.</p>
              </div>
              <div className={styles.useCase}>
                <h4>🔐 Authentication Proxy</h4>
                <p>Add JWT or API key auth to any service with exclude patterns.</p>
              </div>
              <div className={styles.useCase}>
                <h4>🚀 Microservices</h4>
                <p>Route to multiple backend services with priority routing.</p>
              </div>
              <div className={styles.useCase}>
                <h4>⚡ Edge Caching</h4>
                <p>Cache responses at the edge with Cloudflare Cache API.</p>
              </div>
              <div className={styles.useCase}>
                <h4>🎯 A/B Testing</h4>
                <p>Split traffic for experiments with feature flags.</p>
              </div>
              <div className={styles.useCase}>
                <h4>🖼️ Image Optimization</h4>
                <p>Transform and optimize images on-the-fly at the edge.</p>
              </div>
            </div>
          }
          title="Perfect for Any Edge Use Case"
          text={
            <>
              <p>
                EdgeMaster scales from simple APIs to complex distributed systems.
                Whether you're building an <b>API gateway</b>, <b>authentication proxy</b>,
                or <b>microservices router</b>, EdgeMaster provides the structure you need.
              </p>
              <p>
                With <b>10 comprehensive examples</b> covering common patterns, you can
                get started quickly and learn best practices from real-world code.
              </p>
              <Link
                to="/docs/Examples"
                className="button button--primary button--lg"
              >
                View All Examples →
              </Link>
            </>
          }
        />

        {/* Community & Resources */}
        <section className={styles.communitySection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Community & Resources</h2>
            <div className={styles.resourceGrid}>
              <Link to="/docs/getting-started" className={styles.resourceCard}>
                <div className={styles.resourceIcon}>📚</div>
                <h3>Documentation</h3>
                <p>Comprehensive guides, API reference, and tutorials</p>
              </Link>
              <Link to="/docs/Examples" className={styles.resourceCard}>
                <div className={styles.resourceIcon}>💡</div>
                <h3>10 Examples</h3>
                <p>API Gateway, Auth, Caching, Microservices, and more</p>
              </Link>
              <Link to="https://github.com/sharif3271/edge-master/issues" target="_blank" className={styles.resourceCard}>
                <div className={styles.resourceIcon}>🐛</div>
                <h3>GitHub Issues</h3>
                <p>Report bugs and request features</p>
              </Link>
              <Link to="mailto:sharif3271@gmail.com" className={styles.resourceCard}>
                <div className={styles.resourceIcon}>📧</div>
                <h3>Email Support</h3>
                <p>Get help from the maintainer directly</p>
              </Link>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>~14 KB</div>
                <div className={styles.statLabel}>Bundle Size</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>0</div>
                <div className={styles.statLabel}>Dependencies</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>94.65%</div>
                <div className={styles.statLabel}>Test Coverage</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>45</div>
                <div className={styles.statLabel}>Passing Tests</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container">
            <h2>Ready to Build Amazing Edge Applications?</h2>
            <p>Get started in 60 seconds or explore the documentation</p>
            <div className={styles.ctaButtons}>
              <Link
                className="button button--primary button--lg"
                to={useBaseUrl('/docs/getting-started/')}>
                Get Started →
              </Link>
              <Link
                className="button button--outline button--secondary button--lg"
                to={useBaseUrl('/docs/Intro/')}>
                Read the Docs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default Home
