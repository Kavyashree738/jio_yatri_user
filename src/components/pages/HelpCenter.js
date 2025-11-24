import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/HelpCenter.css';
import { useTranslation } from "react-i18next";

const HelpCenter = () => {
  const { t } = useTranslation();

  return (
    <section className="help-center-section" id="help">
      <h2 className="title">{t("help_center_title")}</h2>

      <p className="subtitle">
        {t("help_center_subtitle")}
      </p>

      <Link to="/help-details" className="know-more-btn">
        {t("help_center_button")}
      </Link>
    </section>
  );
};

export default HelpCenter;
