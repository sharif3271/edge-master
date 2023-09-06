import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import GithubIcon from "@site/static/icons/github.svg";
import LinkedInIcon from "@site/static/icons/linkedin.svg";
import YoutubeIcon from "@site/static/icons/youtube.svg";
import styles from "./styles.module.scss";

const CustomFooter = () => (
<footer style={{marginTop: 25}} className={styles["custom-footer-wrapper"]}>
  <div style={{display: 'flex'}} className={styles["logo-wrapper"]}>
    <img src={useBaseUrl("/img/logo.svg")} /><span style={{transform: 'translateY(2px)', fontSize: 18, color: '#ea5906', marginLeft: 3}}><i><b> EdgeMaster</b></i></span>
  </div>
  <div className={styles["copyright"]}>
    {`© ${new Date().getFullYear()} EdgeMaster. All rights reserved`}
  </div>
  <div className={styles["footerSocialIconsWrapper"]}>
    <div className={styles["socialBrands"]}>
      <Link
        href={"https://github.com/"}
        rel="noopener noreferrer"
        aria-label={"Github"}
      >
        <GithubIcon />
      </Link>
    </div>
    <div className={styles["socialBrands"]}>
      <Link
        href={"https://www.youtube.com/"}
        rel="noopener noreferrer"
        aria-label={"Youtube"}
      >
        <YoutubeIcon />
      </Link>
    </div>
    <div className={styles["socialBrands"]}>
      <Link
        href={"https://www.linkedin.com/"}
        rel="noopener noreferrer"
        aria-label={"Linkedin"}
      >
        <LinkedInIcon />
      </Link>
    </div>
  </div>
</footer>
);

export default CustomFooter;
