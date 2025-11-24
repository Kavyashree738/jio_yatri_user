import React from 'react';
import '../../styles/WhyChoosePorter.css';
import { useTranslation } from "react-i18next";

const WhyChoosePorter = () => {
  const { t } = useTranslation();

  return (
    <section className="why-choose-porter">
      <h2>{t("why_title")}</h2>

      <div className="features">

        <div className="feature-card">
          <h3>{t("why_heading_1")}</h3>
          <p>{t("why_desc_1")}</p>
        </div>

        <div className="feature-card">
          <h3>{t("why_heading_2")}</h3>
          <p>{t("why_desc_2")}</p>
        </div>

        <div className="feature-card">
          <h3>{t("why_heading_3")}</h3>
          <p>{t("why_desc_3")}</p>
        </div>

        <div className="feature-card">
          <h3>{t("why_heading_4")}</h3>
          <p>{t("why_desc_4")}</p>
        </div>

      </div>
    </section>
  );
};

export default WhyChoosePorter;
