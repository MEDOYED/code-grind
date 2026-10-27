import { useRef, useEffect, useState } from "react";

import type { DailyStats } from "@core/types";
import { getLocalDate } from "@core/lib/date";

import { generateHeatmapGrid } from "./generate-heatmap-grid";

import s from "./activity-heatmap.module.scss";

type ActivityHeatmapProps = {
  dailyStats: DailyStats;
};

export const ActivityHeatmap = ({
  dailyStats,
}: ActivityHeatmapProps) => {
  const heatmapData = generateHeatmapGrid(dailyStats);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const todayDate = getLocalDate();

  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  //  initial scroll heatmap to end
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.scrollLeft = 10000;
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      scrollElement.scrollLeft += e.deltaY;
    };

    scrollElement.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      scrollElement.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <section className={s.section}>
      <div>
        {selectedDate}: {dailyStats[selectedDate] || 0} symbols
      </div>

      <div
        className={s.gridWrapper}
        ref={scrollRef}
      >
        {heatmapData.map((week, index) => (
          <div
            className={s.week}
            key={index}
          >
            {week.map(day => (
              <div
                className={`${s.day} ${s[`level_${day.activityLevel}`]} ${day.date === selectedDate && s.selectedActive}`}
                onClick={() => setSelectedDate(day.date)}
                key={day.date}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
