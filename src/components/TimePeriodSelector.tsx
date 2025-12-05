import React from "react";
import { TIME_PERIODS } from "../constants";

interface TimePeriodSelectorProps {
  selectedPeriod: keyof typeof TIME_PERIODS;
  onPeriodChange: (period: keyof typeof TIME_PERIODS) => void;
}

function TimePeriodSelector({ selectedPeriod, onPeriodChange }: TimePeriodSelectorProps) {
  const timePeriods = Object.keys(TIME_PERIODS) as (keyof typeof TIME_PERIODS)[];

  return (
    <div className="d-flex justify-content-center mb-3">
      <div className="btn-group" role="group">
        {timePeriods.map((period) => (
          <button
            key={period}
            type="button"
            className={`btn ${selectedPeriod === period ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onPeriodChange(period)}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}

export default React.memo(TimePeriodSelector); 