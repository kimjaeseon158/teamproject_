const submitWorkInfo = async ({
  user,
  employeeNumber,
  selectedDate,
  startTime,
  finishTime,
  totalWorkTime,
  location,
}) => {
  console.log(employeeNumber)
  const formattedDate = selectedDate instanceof Date
    ? selectedDate.toLocaleDateString()
    : `${selectedDate.formatted}`;

  const totalTimeString = totalWorkTime;

  const newRecord = {
      user_name: user,
      work_start: `${formattedDate} ${startTime}:00`,
      work_end: `${formattedDate} ${finishTime}:00`,
      total_time: totalTimeString,
      work_date: formattedDate,
      work_place: location,
      employee_number: employeeNumber,
      state : `status`
  };

  const response = await fetch("/api/ user_work_info/", {
    method: "Patch",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newRecord),
    credentials: "include"
  });

  const data = await response.json();
  return { data, newRecord };
};

export default submitWorkInfo;
