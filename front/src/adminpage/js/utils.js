export const formatResidentNumber = (value) => {
  const sanitized_value = value.replace(/[^0-9]/g, "").slice(0, 13);
  return sanitized_value.length > 6
    ? sanitized_value.slice(0, 6) + "-" + sanitized_value.slice(6)
    : sanitized_value;
};

export const formatPhoneNumber = (value) => {
  const sanitized_value = value.replace(/[^0-9]/g, "").slice(0, 11);

  if (sanitized_value.length >= 11) {
    return sanitized_value.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (sanitized_value.length >= 7) {
    return sanitized_value.replace(/(\d{3})(\d{4})(\d*)/, (_, g1, g2, g3) =>
      g3 ? `${g1}-${g2}-${g3}` : `${g1}-${g2}`
    );
  } else if (sanitized_value.length >= 4) {
    return sanitized_value.replace(/(\d{3})(\d*)/, (_, g1, g2) =>
      g2 ? `${g1}-${g2}` : g1
    );
  }
  return sanitized_value;
};
