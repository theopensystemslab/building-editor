import Slider from "@material-ui/core/Slider";
import format from "date-fns/format";
import getDayOfYear from "date-fns/getDayOfYear";
import setDayOfYear from "date-fns/setDayOfYear";
import React, { useState } from "react";

const Sun = () => {
  const today = new Date();
  const [latLng, setLatLng] = useState([51.5, -0.1]); // london
  const [date, setDate] = useState(getDayOfYear(today));
  // const [time, setTime] = useState(new Date());

  // morning, afternoon, evening, night
  // 7:00, 13:00, 18:00, 01:00

  return (
    <div style={{ paddingTop: 50 }}>
      <Slider
        defaultValue={date}
        aria-labelledby="discrete-slider-small-steps"
        step={1}
        marks
        min={0}
        max={365}
        valueLabelDisplay="auto"
        valueLabelFormat={(x) => format(setDayOfYear(today, x), "MMM d")}
        onChange={(e, v) => setDate(v)}
      />
    </div>
  );
};

export default Sun;
