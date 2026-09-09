function StatCard({ icon, title, value, description }) {
  return (
    <div className="stat-card">

      <div className="stat-top">
        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <div className="stat-title">
        {title}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <small>
        {description}
      </small>

    </div>
  );
}

export default StatCard;