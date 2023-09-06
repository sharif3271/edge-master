import React from 'react'
import clsx from 'clsx'
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './highlight.module.css'

export default function Highlight({ reversed, title, img, text, isDark }) {
    const left = <div className={clsx('col col--6', styles.featureImage, reversed ? styles.featureImageReversed : '')}>{img}</div>
    const right = (
        <div className={clsx('col col--6', styles.featureContent, reversed ? styles.featureContentReversed : '')}>
            <h3 className={styles.featureTitle}>{title}</h3>
            {text}
        </div>
    )
    // const window = window ? window : { innerWidth: 1920 }

    return (
        <section className={clsx('highlightSection', isDark ? styles.darkSection + ' darkSection' : '')}>
            <div className="container">
                <div className={clsx('row', styles.highlightSectionMobile)}>
                    <BrowserOnly>
                        {
                            () => <>
                                {
                                    window && window?.innerWidth < 961 ? <>
                                        {right}
                                        {left}
                                    </> : <>
                                        {reversed ? (
                                            <>
                                                {right}
                                                {left}
                                            </>
                                        ) : (
                                            <>
                                                {left}
                                                {right}
                                            </>
                                        )}
                                    </>
                                }
                            </>
                        }
                    </BrowserOnly>
                </div>
            </div>
        </section>
    )
}
