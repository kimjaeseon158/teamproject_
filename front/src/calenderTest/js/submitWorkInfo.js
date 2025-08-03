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
    data_type: "user_work_info",
    data: {
      user_name: user,
      work_start: `${formattedDate} ${startTime}:00`,
      work_end: `${formattedDate} ${finishTime}:00`,
      total_time: totalTimeString,
      work_date: formattedDate,
      work_place: location,
      employee_number: employeeNumber,
    },
  };

  const response = await fetch("http://127.0.0.1:8000/api/items/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newRecord),
  });

  const data = await response.json();
  return { data, newRecord };
};

export default submitWorkInfo;
