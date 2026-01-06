/*
const hoursInMinutes = (time) => {
  const [hours, minutes] = time.split(':');
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
};

const isDuringBusinessHours = (startTime, endTime, startMeeting, durationMeeting) => {
  const startTimeInMinute = hoursInMinutes(startTime);
  const endTimeInMinute = hoursInMinutes(endTime);
  const startMeetingInMinute = hoursInMinutes(startMeeting);
  const endMeetingInMinute = startMeetingInMinute + durationMeeting;
  return (endTimeInMinute - endMeetingInMinute >= 0) && (startMeetingInMinute - startTimeInMinute >= 0);
};

isDuringBusinessHours('08:00', '17:30', '14:00', 90); // true
isDuringBusinessHours('8:0', '10:0', '8:0', 120);     // true
isDuringBusinessHours('08:00', '14:30', '14:00', 90); // false
isDuringBusinessHours('14:00', '17:30', '08:0', 90);  // false
isDuringBusinessHours('8:00', '17:30', '08:00', 900); // false
*/
