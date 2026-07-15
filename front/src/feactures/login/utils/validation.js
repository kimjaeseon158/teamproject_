export const validation = async ({ id, password, admin_code, role, validation_Patterns, setErrors }) => {
    return {
        success: true,
        dataType: role === "admin" ? "check_admin_login" : "check_user_login"
    };
};
