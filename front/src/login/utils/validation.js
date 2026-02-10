export const validation = async ({ role }) => {
    return {
        success: true,
        dataType: role === "admin" ? "check_admin_login" : "check_user_login"
    };
};
