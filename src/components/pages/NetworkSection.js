import React from 'react';
import '../../styles/NetworkSection.css';
import { useTranslation } from "react-i18next";

const NetworkSection = () => {
  const { t } = useTranslation();

  return (
    <section className="network-section">
      <h2 className="section-title h2">{t("network_title")}</h2>

      <div className="network-stats">

        <div className="stat-card">
          <h3>21+</h3>
          <p>{t("network_stat_1_label")}</p>
        </div>

        <div className="stat-card">
          <h3>10,000+</h3>
          <p>{t("network_stat_2_label")}</p>
        </div>

        <div className="stat-card">
          <h3>5000+</h3>
          <p>{t("network_stat_3_label")}</p>
        </div>

      </div>
    </section>
  );
};

export default NetworkSection;
