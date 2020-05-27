import Slider from "@material-ui/core/Slider";
import format from "date-fns/format";
import getDayOfYear from "date-fns/getDayOfYear";
import setDayOfYear from "date-fns/setDayOfYear";
import React, { useState } from "react";
import SunCalc from "suncalc";

const Sun = () => {
  const today = new Date();
  const [latLng, setLatLng] = useState([51.5, -0.1]); // london
  const [date, setDate] = useState(getDayOfYear(today));
  // const [time, setTime] = useState(new Date());

  // morning, afternoon, evening, night
  // 7:00, 13:00, 18:00, 01:00

  // get today's sunlight times
  const times = SunCalc.getTimes(setDayOfYear(today, date), ...latLng);
  // get position of the sun (azimuth and altitude) at today's sunrise
  const sunrisePos = SunCalc.getPosition(times.sunrise, 51.5, -0.1);

  const sun = {
    times,
    // format sunrise time from the Date object
    sunriseStr: times.sunrise.getHours() + ":" + times.sunrise.getMinutes(),
    sunrisePos,
    // get sunrise azimuth in degrees
    sunriseAzimuth: (sunrisePos.azimuth * 180) / Math.PI,
  };

  return (
    <div>
      <pre>{JSON.stringify(sun, null, 2)}</pre>

      <Slider
        defaultValue={date}
        aria-labelledby="discrete-slider-small-steps"
        step={1}
        marks
        min={0}
        max={365}
        valueLabelDisplay="auto"
        valueLabelFormat={(x) => format(setDayOfYear(today, x), "MMM d")}
        onChange={(e, v: number) => setDate(v)}
      />
    </div>
  );
};

export default Sun;
