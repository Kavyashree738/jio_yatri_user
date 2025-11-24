import React from 'react';
import '../../styles/Footer.css';
import logo from '../../assets/images/footer-logo-image.png';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import qr from '../../assets/images/qr-code.png';
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-top">

        {/* Logo */}
        <div className="footer-logo">
          <img src={logo} alt={t("footer_logo_alt")} />
          <p>{t("trusted_partner")}</p>
        </div>

        {/* Social Media */}
        <div className="footer-social">
          <h4>{t("follow_us")}</h4>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>

        {/* App Download */}
        <div className="footer-app">
          <h4>{t("download_our_app")}</h4>
          <img src={qr} alt={t("qr_alt")} className="qr-code" />
          <p>{t("scan_to_install")}</p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="footer-bottom">
        <p>{t("cin")}: U62020KA2025PTC197886</p>
        <h3>{t("header_company_name")}</h3>

        <div className="footer-links">
          <a href="#">{t("about_us")}</a>
          <a href="#">{t("careers")}</a>
          <a href="#">{t("contact")}</a>
          <a href="#">{t("privacy_policy")}</a>
          <a href="#">{t("terms_conditions")}</a>
        </div>

        <p>© {new Date().getFullYear()} {t("copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
