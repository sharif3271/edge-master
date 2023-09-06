import React, { useRef, useEffect } from 'react'
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
import { features, ComponentTestingExample } from '../constants.js'
import '../utils/libs/Ribbons.js'

function Home() {
  const ref = useRef(null)

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
  return (
    <Layout
      title={`${siteConfig.title} · ${siteConfig.tagline}`}
      description={`${siteConfig.tagline}`}>
      <header className={clsx('hero hero--primary stmsrc', styles.heroBanner)} ref={ref}>
        <div className="container">
          <h1 className="hero__title">
            <Logo />
          </h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('/docs/gettingstarted')}>
              Get Started
            </Link>
            <Link
              to="/docs/why-edge-master"
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
            >Why EdgeMaster?</Link>
            <Link
              target='_blank'
              to="https://github.com/Sharif3271/edge-master"
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
            >View on GitHub</Link>
          </div>
          <Features features={features} />
        </div>
      </header>
      <main>
        <Highlight
          img={
            <CodeBlock language="js" children={ComponentTestingExample}></CodeBlock>
          }
          isDark
          title="Super Flexible Framework:"
          text={
            <>
              <p>
                Edge Master is a super flexible framework that empowers developers with unparalleled control over their edge environment.
                Its <b>flexibility</b> isn't just a buzzword;
                it's the key to creating truly dynamic and custom solutions for a wide range of use cases.
                At the heart of this flexibility lies its unique ability to extendability.
                Edge Master allows you to effortlessly <b>adapt and expand</b> your application's capabilities as your project evolves,
                providing a solid foundation for innovation.
              </p>
              <p>
                you can define a chain of tasks that manipulate incoming requests and outgoing responses.
                This <b>task-based</b> architecture offers the freedom to tailor the flow of data exactly to your requirements.
                Need to terminate a chain early to optimize performance or implement specific logic? Edge Master makes it a breeze.
                With this level of adaptability, it's not just a framework; it's your go-to toolkit for creating powerful edge applications.
              </p>
            </>
          }
        />
      </main>
    </Layout>
  )
}

export default Home
