export type TimeBasedEvent = {
  atHour: number;
  nearMinute?: Minute;
  frequency?: {
    type: "everyDays";
    interval: 1;
  };
};

type Minute = 1 | 5 | 10 | 15 | 30;
